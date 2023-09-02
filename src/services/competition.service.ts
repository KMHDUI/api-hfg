import { Request, Response } from "express";
import { db } from "../database/firestore";
import { AuthRequest } from "../types/types";
import { RegisterCompetitionDto } from "../dto/competition.dto";
import { getBillingUniqueCode } from "../utils/getBillingUniqueCode";

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

export const getMyCompetitionHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId as string;
  console.log(userId);
  const userDb = db.collection("user");
  const userToCompetitionDb = db.collection("user_to_competition");

  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res
      .status(404)
      .send({ message: `User with id ${userId} is not found` });
  }

  const competitions = await userToCompetitionDb
    .where("user", "==", userDb.doc(userId))
    .get();
  const competitionList: FirebaseFirestore.DocumentData[] = [];

  competitions.forEach((competition) => {
    const data = competition.data();
    competitionList.push({
      id: competition.id,
      type: data.competition_type,
      name: data.competition_name,
    });
  });

  return res.status(200).send({
    message: "List of your competition already returned",
    data: competitionList,
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
  const billDb = db.collection("bill");

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
    return res.status(400).send({
      message:
        "You already registered on this competition. Cannot register again!",
    });
  }

  const userDetail = (
    await userDetailDb.where("user", "==", userDb.doc(userId)).get()
  ).docs[0].data();

  try {
    await db.runTransaction(async (transaction) => {
      const userToCompetitionRef = userToCompetitionDb.doc();
      transaction.create(userToCompetitionRef, {
        id: userToCompetitionRef.id,
        user: userDb.doc(userId),
        user_email: user.email,
        user_fullname: user.fullname,
        user_college: userDetail.college,
        competition: competitionDb.doc(competitionId),
        competition_name: competition.name,
        competition_type: competition.type,
        status: "Not Submitted",
        created_at: new Date(),
        updated_at: new Date(),
      });

      const realPrice = 50000;
      const uniqueCode = getBillingUniqueCode(realPrice);
      const totalBill = realPrice + uniqueCode;

      const billRef = billDb.doc();
      transaction.create(billRef, {
        user_to_competition: userToCompetitionRef,
        user: userDb.doc(userId),
        user_email: user.email,
        user_fullname: user.fullname,
        user_college: userDetail.college,
        competition: competitionDb.doc(competitionId),
        competition_name: competition.name,
        competition_type: competition.type,
        bill_total: totalBill,
        real_price: realPrice,
        unique_code: uniqueCode,
        status: "Not Paid",
        created_at: new Date(),
        updated_at: new Date(),
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
          bill_id: billRef.id,
          bill_total: totalBill,
          real_price: realPrice,
          unique_code: uniqueCode,
        },
      });
    });
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};
