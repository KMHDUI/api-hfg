import { Request, Response } from "express";
import { LoginUserDto, RegisterUserDto } from "../dto/user.dto";
import { db } from "../database/firestore";
import bcrypt from "bcrypt";
import generateJwtToken from "../utils/generateJwtToken";

export const loginUserHandler = async (req: Request, res: Response) => {
  const { email, password }: LoginUserDto = req.body;
  const userDb = db.collection("user");
  const user = await userDb.where("email", "==", email).get();

  if (user.empty) {
    return res
      .status(404)
      .send({ message: `User with email ${email} is not found` });
  }

  const userData = user.docs[0].data();
  const isPasswordMatch = await bcrypt.compare(password, userData.password);

  if (!isPasswordMatch)
    return res.status(400).send({ message: "Wrong password" });

  const token = generateJwtToken({ id: user.docs[0].id, email: email });

  return res
    .status(200)
    .send({ message: "Login success", data: userData, token: token });
};

export const registerUserHandler = async (req: Request, res: Response) => {
  const data: RegisterUserDto = req.body;
  const userDb = db.collection("user");
  const userDetailDb = db.collection("user_detail");

  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    await db.runTransaction(async (transaction) => {
      const userQuery = userDb.where("email", "==", data.email).limit(1);
      const userSnapshots = await transaction.get(userQuery);

      if (!userSnapshots.empty) {
        return res
          .status(400)
          .send({ message: `User with email ${data.email} already exists` });
      }

      const phoneQuery = userDb.where("phone", "==", data.phone).limit(1);
      const phoneSnapshots = await transaction.get(phoneQuery);

      if (!phoneSnapshots.empty) {
        return res.status(400).send({
          message: `User with phone number ${data.phone} already exists`,
        });
      }

      const insertedUserRef = userDb.doc();
      transaction.create(insertedUserRef, {
        fullname: data.fullname,
        nickname: data.nickname,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
        status: data.status,
      });

      const userDetailRef = userDetailDb.doc();
      transaction.create(userDetailRef, {
        user: insertedUserRef,
        college: data.college,
      });

      const token = generateJwtToken({
        id: insertedUserRef.id,
        email: data.email,
      });

      return res.status(201).send({
        message: "Registration success",
        data: { id: insertedUserRef.id },
        token: token,
      });
    });
  } catch (error: any) {
    return res.status(500).send(error.message);
  }
};
