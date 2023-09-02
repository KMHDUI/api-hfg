import { Response } from "express";
import { AuthRequest } from "../types/types";
import { CancelPaymentDto, PaymentDto } from "../dto/payment.dto";
import { db } from "../database/firestore";

export const paymentHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const { billId, imageUrl }: PaymentDto = req.body;
  const userDb = db.collection("user");
  const billDb = db.collection("bill");
  const paymentDb = db.collection("payment");

  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res.status(400).send({ message: "User is not found" });
  }

  const bill = (await billDb.doc(billId).get()).data();
  if (!bill) {
    return res.status(400).send({ message: "Billing is not found" });
  }

  if (bill.status === "Paid") {
    return res.status(400).send({ message: "Billing is already paid" });
  }

  const prevPayment = await paymentDb
    .where("billing", "==", billDb.doc(billId))
    .where("status", "==", "Pending")
    .get();

  if (!prevPayment.empty) {
    return res.status(400).send({
      message:
        "There is payment request that still not verified by admin. Please wait for the verification",
      data: prevPayment.docs[0].data(),
    });
  }

  try {
    const payment = await paymentDb.add({
      billing: billDb.doc(billId),
      user: userDb.doc(userId),
      user_fullname: user.fullname,
      image_url: imageUrl,
      status: "Pending",
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(200).send({
      message: "Successfully send the payment. Please wait admin verification",
      data: {
        payment_id: payment.id,
        billing_id: billId,
        total_payment: bill.bill_total,
      },
    });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const cancelPaymentHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const { paymentId }: CancelPaymentDto = req.body;
  const userDb = db.collection("user");
  const paymentDb = db.collection("payment");

  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res.status(400).send({ message: "User is not found" });
  }

  const payment = (await paymentDb.doc(paymentId).get()).data();
  if (!payment) {
    return res.status(400).send({ message: "Payment data is not found" });
  }

  if (payment.status !== "Pending") {
    return res
      .status(400)
      .send({ message: "You only can cancel payment with pending status" });
  }

  if (payment.user.id !== userId) {
    return res.status(400).send({
      message: "You only can cancel your own payment",
    });
  }

  try {
    await paymentDb.doc(paymentId).set({ status: "Cancel" }, { merge: true });
    return res.status(200).send({
      message: "Payment is already cancelled",
      data: {
        payment_id: paymentId,
      },
    });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};
