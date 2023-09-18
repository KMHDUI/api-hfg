import { Request, Response } from "express";
import { db } from "../database/firestore";
import { AuthRequest } from "../types/types";
import {
  ChangeMemberStatusDto,
  JoinGroupCompetitionByCodeDto,
  RegisterCompetitionDto,
  SubmitSubmissionDto,
} from "../dto/competition.dto";
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
  const userDb = db.collection("user");
  const userToCompetitionDb = db.collection("user_to_competition");
  const billDb = db.collection("bill");
  const paymentDb = db.collection("payment");

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

  for (const competition of competitions.docs) {
    const data = competition.data();
    const bill = (
      await billDb
        .where(
          "user_to_competition",
          "==",
          userToCompetitionDb.doc(competition.id)
        )
        .select("real_price", "bill_total", "unique_code", "status")
        .get()
    ).docs[0];
    const payments = await paymentDb
      .where("bill", "==", billDb.doc(bill.id))
      .select("created_at", "updated_at", "image_url", "status")
      .orderBy("updated_at", "desc")
      .get();
    const competitionData = {
      code: data.id,
      type: data.competition_type,
      name: data.competition_name,
      is_active: data.is_active,
      competition_using_submission: data.competition_using_submission,
      submission_status: data.submission_status,
      payment_status: data.payment_status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      bill: { ...bill.data(), id: bill.id },
      payments: payments.docs.map((payment) => {
        return { ...payment.data(), id: payment.id };
      }),
    } as any;

    if (
      data.competition_using_submission &&
      data.submission_status === "Submitted"
    ) {
      competitionData.url = data.url;
    }

    competitionList.push(competitionData);
  }

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
      const insertedData = {
        id: userToCompetitionRef.id,
        is_owner: true,
        user: userDb.doc(userId),
        user_email: user.email,
        user_fullname: user.fullname,
        user_college: userDetail.college,
        competition: competitionDb.doc(competitionId),
        competition_name: competition.name,
        competition_type: competition.type,
        competition_using_submission: competition.using_submission,
        payment_status: "Not Paid",
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      } as any;

      if (competition.using_submission) {
        insertedData.submission_status = "Not Submitted";
      }

      transaction.create(userToCompetitionRef, insertedData);

      const realPrice = competition.price;
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
          code: userToCompetitionRef.id,
          is_owner: true,
          user_id: userId,
          user_email: user.email,
          user_fullname: user.fullname,
          user_college: userDetail.college,
          competition_id: competitionId,
          competition_name: competition.name,
          competition_type: competition.type,
          competition_using_submission: competition.using_submission,
          bill_id: billRef.id,
          bill_total: totalBill,
          real_price: realPrice,
          unique_code: uniqueCode,
          payment_status: "Not Paid",
          is_active: true,
        },
      });
    });
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

export const joinGroupCompetitionByCodeHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const { competitionId, code }: JoinGroupCompetitionByCodeDto = req.body;
  const userId = req.userId as string;
  const userDb = db.collection("user");
  const competitionDb = db.collection("competition");
  const userToCompetitionDb = db.collection("user_to_competition");
  const userDetailDb = db.collection("user_detail");

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

  const userToCompetition = await userToCompetitionDb
    .where("user", "==", db.doc(`user/${userId}`))
    .where("competition", "==", db.doc(`competition/${competitionId}`))
    .get();

  if (!userToCompetition.empty) {
    return res.status(400).send({
      message:
        "You already registered on this competition. Cannot register again!",
    });
  }

  const checkCode = await userToCompetitionDb
    .where("competition", "==", db.doc(`competition/${competitionId}`))
    .where("id", "==", code)
    .where("competition_type", "==", "team")
    .get();

  if (checkCode.empty) {
    return res.status(400).send({
      message: "Your code is not accepted by our system!",
    });
  }

  const userDetail = (
    await userDetailDb.where("user", "==", userDb.doc(userId)).get()
  ).docs[0].data();

  try {
    await db.runTransaction(async (transaction) => {
      const userToCompetitionRef = userToCompetitionDb.doc();
      const insertedData = {
        id: code,
        is_owner: false,
        user: userDb.doc(userId),
        user_email: user.email,
        user_fullname: user.fullname,
        user_college: userDetail.college,
        competition: competitionDb.doc(competitionId),
        competition_name: competition.name,
        competition_type: competition.type,
        competition_using_submission: competition.using_submission,
        acceptance_status: "Pending",
        is_active: false,
        created_at: new Date(),
        updated_at: new Date(),
      } as any;
      if (competition.using_submission) {
        insertedData.submission_status = "Not Submitted";
      }

      transaction.create(userToCompetitionRef, insertedData);

      return res.status(200).send({
        message: "Successfully register the competition",
        data: {
          code: userToCompetitionRef.id,
          is_owner: false,
          user_id: userId,
          user_email: user.email,
          user_fullname: user.fullname,
          user_college: userDetail.college,
          competition_id: competitionId,
          competition_name: competition.name,
          competition_type: competition.type,
          competition_using_submission: competition.using_submission,
          acceptance_status: "Pending",
          is_active: false,
        },
      });
    });
  } catch (err: any) {
    return res.status(500).send({ message: err.message });
  }
};

export const changeMemberStatusHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const { code, status, memberId }: ChangeMemberStatusDto = req.body;
  const userId = req.userId as string;
  const userDb = db.collection("user");
  const userToCompetitionDb = db.collection("user_to_competition");

  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res
      .status(404)
      .send({ message: `User with id ${userId} is not found` });
  }

  const member = (await userDb.doc(memberId).get()).data();
  if (!member) {
    return res
      .status(404)
      .send({ message: `User with id ${memberId} is not found` });
  }

  const checkCode = await userToCompetitionDb
    .where("id", "==", code)
    .where("competition_type", "==", "team")
    .where("user", "==", db.doc(`user/${memberId}`))
    .get();

  if (checkCode.empty) {
    return res.status(400).send({
      message: "Member id is not exist in your competition request list",
    });
  }

  try {
    await userToCompetitionDb.doc(checkCode.docs[0].id).set(
      {
        acceptance_status: status,
        is_active: status === "Accepted" ? true : false,
        updated_at: new Date(),
      },
      { merge: true }
    );

    return res
      .status(200)
      .send({ message: "Successfully change the user status" });
  } catch (error: any) {
    res.status(500).send({ message: error.message });
  }
};

export const getCompetitionDetailHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const code = req.params.code;
  const userId = req.userId as string;
  const userDb = db.collection("user");
  const userToCompetitionDb = db.collection("user_to_competition");
  const billDb = db.collection("bill");
  const paymentDb = db.collection("payment");

  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res
      .status(404)
      .send({ message: `User with id ${userId} is not found` });
  }

  const bill = (
    await billDb
      .where("user_to_competition", "==", userToCompetitionDb.doc(code))
      .select("real_price", "bill_total", "unique_code", "status")
      .get()
  ).docs[0];
  const billData = bill.data();

  const payments = await paymentDb
    .where("bill", "==", billDb.doc(bill.id))
    .select("created_at", "updated_at", "image_url", "status")
    .orderBy("updated_at", "desc")
    .get();

  const competitionDetail = await userToCompetitionDb.doc(code).get();
  let data = competitionDetail.data() as any;
  delete data?.is_owner;
  delete data?.user_college;
  delete data?.user_email;
  delete data?.user_fullname;
  delete data?.user;

  data.bill = { ...billData, id: bill.id };
  data.payments = payments.docs.map((payment) => {
    return { ...payment.data(), id: payment.id };
  });

  if (!competitionDetail.exists && data) {
    return res.status(400).send({
      message: "Code is not registered in our system",
    });
  }

  if (data?.competition_type === "team") {
    const members = await userToCompetitionDb
      .where("id", "==", code)
      .where("acceptance_status", "in", ["Accepted", "Pending"])
      .select(
        "user_email",
        "user_fullname",
        "user_college",
        "is_active",
        "acceptance_status",
        "is_owner"
      )
      .get();
    const owner = await userToCompetitionDb
      .where("id", "==", code)
      .where("is_owner", "==", true)
      .select(
        "user_email",
        "user_fullname",
        "user_college",
        "is_active",
        "acceptance_status",
        "is_owner"
      )
      .get();
    const memberList: any[] = [];
    memberList.push(owner.docs[0].data());
    members.forEach((member) => {
      memberList.push(member.data());
    });
    data.members = memberList;
  }

  return res
    .status(200)
    .send({ message: "Successfully get the competition detail", data: data });
};

export const submitSubmissionHandler = async (
  req: AuthRequest,
  res: Response
) => {
  let userId = req.userId as string;
  const { code, url }: SubmitSubmissionDto = req.body;

  const userDb = db.collection("user");
  const userToCompetitionDb = db.collection("user_to_competition");

  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res
      .status(404)
      .send({ message: `User with id ${userId} is not found` });
  }

  const competitionDetail = await userToCompetitionDb.doc(code).get();
  let data = competitionDetail.data();

  if (!competitionDetail.exists && data) {
    return res.status(400).send({
      message: "Code is not registered in our system",
    });
  }

  if (!data?.competition_using_submission) {
    return res
      .status(400)
      .send({ message: "This competition is not using submission" });
  }

  try {
    await userToCompetitionDb.doc(code).set(
      {
        url: url,
        submission_status: "Submitted",
        updated_at: new Date(),
      },
      { merge: true }
    );

    return res.status(200).send({
      message: "Succesfully submit the item",
      data: { url: url, code: code, submission_status: "Submitted" },
    });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const getAllRegistrationHandler = async (
  _req: Request,
  res: Response
) => {
  const userToCompetitionDb = db.collection("user_to_competition");
  const userDb = db.collection("user");
  const billDb = db.collection("bill");
  const paymentDb = db.collection("payment");
  const userToCompetition = await userToCompetitionDb
    .where("is_owner", "==", true)
    .orderBy("created_at", "desc")
    .select(
      "competition_name",
      "competition_type",
      "competition_using_submission",
      "created_at",
      "is_active",
      "id",
      "user_college",
      "user_email",
      "user_fullname",
      "payment_status",
      "submission_status",
      "url"
    )
    .get();

  const blockedUser = await userDb.where("is_blocked", "==", true).get();
  const blockedUserData = blockedUser.docs.map(
    (blocked) => blocked.data().email
  );

  const data = [];
  for (const registration of userToCompetition.docs) {
    const registrationData = registration.data();
    if (blockedUserData.includes(registrationData.user_email)) {
      continue;
    }

    const bill = await billDb
      .where(
        "user_to_competition",
        "==",
        userToCompetitionDb.doc(registration.id)
      )
      .get();

    const billData = bill.docs[0].data();
    const payment = await paymentDb
      .where("bill", "==", billDb.doc(bill.docs[0].id))
      .where("status", "!=", "Rejected")
      .get();
    const paymentData = !payment.empty ? payment.docs[0].data() : null;

    if (registrationData.competition_type === "team") {
      const code = registration.id;
      const members = await userToCompetitionDb
        .where("id", "==", code)
        .where("is_owner", "==", false)
        .orderBy("created_at", "desc")
        .select(
          "acceptance_status",
          "user_fullname",
          "user_email",
          "created_at",
          "is_active"
        )
        .get();
      const memberList: FirebaseFirestore.DocumentData[] = [];

      members.forEach((member) => memberList.push(member.data()));

      data.push({
        ...registrationData,
        id: code,
        member: memberList,
        bill: { ...billData, id: bill.docs[0].id },
        payment: {
          ...paymentData,
          id: payment.empty ? null : payment.docs[0].id,
        },
      });
    } else {
      const code = registration.id;
      data.push({
        ...registrationData,
        id: code,
        bill: { ...billData, id: bill.docs[0].id },
        payment: {
          ...paymentData,
          id: payment.empty ? null : payment.docs[0].id,
        },
      });
    }
  }

  return res
    .status(200)
    .send({ message: "Successfully retrived registration data", data: data });
};
