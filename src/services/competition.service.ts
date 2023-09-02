import { Request, Response } from "express";
import { db } from "../database/firestore";
import { AuthRequest } from "../types/types";
import { RegisterCompetitionDto } from "../dto/competition.dto";

export const getAllCompetitionHandler = async (
  _req: Request,
  res: Response
) => {
  const competitionDb = db.collection("competition");
  const competitions = (await competitionDb.get()).docs.map((competition) => {
    return { id: competition.id, ...competition.data() };
  });

  return res.status(200).send({
    message: "List of competition is already retrived",
    data: competitions,
  });
};

export const registerCompetitionHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const { competitionId }: RegisterCompetitionDto = req.body;
  const userId = req.userId as string;
  const userDb = db.collection("user");
  const competitionDb = db.collection("competition");
  const userToCompetitionDb = db.collection("user_to_competition");
  const userDetailDb = db.collection("user_detail");
  const paymentDb = db.collection("payment");

  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res
      .status(404)
      .send({ message: `User with id ${userId} is not found` });
  }

  const competition = (await competitionDb.doc(competitionId).get()).data();
  if (!competition) {
    return res
      .status(404)
      .send({ message: `Competition with id ${competitionId} is not exist` });
  }

  let userToCompetition = await userToCompetitionDb
    .where("user", "==", db.doc(`user/${userId}`))
    .where("competition", "==", db.doc(`competition/${competitionId}`))
    .get();

  if (!userToCompetition.empty) {
    return res
      .status(400)
      .send({ message: "You already register to this competition!" });
  }

  const userDetail = (
    await userDetailDb.where("user", "==", userDb.doc(userId)).get()
  ).docs[0].data();

  try {
    await db.runTransaction(async (transaction) => {
      const userToCompetitionRef = userToCompetitionDb.doc();
      transaction.create(userToCompetitionRef, {
        user: userDb.doc(userId),
        competition: competitionDb.doc(competitionId),
        user_email: user.email,
        user_fullname: user.fullname,
        user_college: userDetail.college,
        competition_name: competition.name,
        competition_type: competition.type,
      });

      const paymentRef = paymentDb.doc();
      transaction.create(paymentRef, {
        user_to_competition: userToCompetitionRef,
        total: 50000,
        status: "Pending",
        user_fullname: user.fullname,
        competition_name: competition.name,
      });

      return res.status(200).send({
        message: "Successfully register the competition",
        data: {
          user_id: userId,
          user_email: user.email,
          user_fullname: user.fullname,
          user_college: userDetail.college,
          competition_id: competitionId,
          competition_name: competition.name,
          competition_type: competition.type,
          payment_id: paymentRef.id,
          payment_total: 50000,
        },
      });
    });
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};
