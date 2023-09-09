import { Request, Response } from "express";
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginUserDto,
  RegisterUserDto,
  VerifyForgotPasswordDto,
} from "../dto/user.dto";
import { db } from "../database/firestore";
import bcrypt from "bcrypt";
import generateJwtToken from "../utils/generateJwtToken";
import { AuthRequest } from "../types/types";
import transporter from "../config/mailer";

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
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
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

export const verificationUserHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const { major, batch, bod, sn, snUrl, haloBelanjaUrl } = req.body;
  const userId = req.userId as string;

  const userDetailDb = db.collection("user_detail");
  const userDb = db.collection("user");
  const userDetailQuery = await userDetailDb
    .where("user", "==", db.doc(`user/${userId}`))
    .get();

  if (userDetailQuery.empty) {
    return res
      .status(404)
      .send({ message: `User details for user with id ${userId} not found` });
  }

  try {
    await userDetailDb.doc(userDetailQuery.docs[0].id).set(
      {
        major: major,
        batch: batch,
        bod: bod,
        sn: sn,
        snUrl: snUrl,
        haloBelanjaUrl: haloBelanjaUrl,
      },
      { merge: true }
    );

    await userDb.doc(userId).set({
      updated_at: new Date(),
    });

    return res.status(200).send({ message: "Verification successful" });
  } catch (error: any) {
    return res.status(500).send({ message: error.message });
  }
};

export const getMyProfileHandler = async (req: AuthRequest, res: Response) => {
  const userId = req.userId as string;
  const userDb = db.collection("user");
  const userDetailDb = db.collection("user_detail");

  const user = (await userDb.doc(userId).get()).data();
  const userDetail = (
    await userDetailDb.where("user", "==", db.doc(`user/${userId}`)).get()
  ).docs[0].data();

  if (!user) {
    return res
      .status(404)
      .send({ message: `User with id ${userId} is not found` });
  }

  const result = {
    fullname: user.fullname,
    nickname: user.nickname,
    email: user.email,
    phone: user.phone,
    status: user.status,
    college: userDetail.college,
    is_verified: user.is_verified ?? false,
  };

  return res
    .status(200)
    .send({ message: "Successful retrieval of user profile.", data: result });
};

export const changePasswordHandler = async (
  req: AuthRequest,
  res: Response
) => {
  const userId = req.userId as string;
  const { oldPassword, newPassword }: ChangePasswordDto = req.body;

  const userDb = db.collection("user");
  const user = (await userDb.doc(userId).get()).data();
  if (!user) {
    return res
      .status(404)
      .send({ message: `User with id ${userId} is not found` });
  }

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatch)
    return res.status(400).send({ message: "Wrong password" });

  try {
    await userDb.doc(userId).set(
      {
        updated_at: new Date(),
        password: await bcrypt.hash(newPassword, 10),
      },
      { merge: true }
    );

    return res.status(200).send({ message: "Password is change successfully" });
  } catch (err: any) {
    return res.status(500).send({ mesage: err.message });
  }
};

export const forgotPasswordHandler = async (req: Request, res: Response) => {
  const { email }: ForgotPasswordDto = req.body;
  const userDb = db.collection("user");
  const forgotPasswordTokenDb = db.collection("forgot_password_token");
  const user = await userDb.where("email", "==", email).get();

  if (user.empty) {
    return res
      .status(404)
      .send({ message: `User with email ${email} is not found` });
  }

  const currentDate = new Date();
  const expiryDate = new Date(
    currentDate.setMinutes(currentDate.getMinutes() + 15)
  );
  const tokenData = await forgotPasswordTokenDb.add({
    expiry: expiryDate,
    userId: user.docs[0].id,
    active: true,
    created_at: new Date(),
    updated_at: new Date(),
  });

  const userData = user.docs[0].data();
  const from = String(process.env.EMAIL_USER);
  const mailData = {
    from: from,
    to: email,
    subject: `Change Password for HFG UI Account`,
    html: `
    <html>
      <body>
        <div style="width: 100%; display:block;">
          <h2>Reset Password</h2>
          <p style="font-size:16px; margin-bottom:10px">
            <strong>Hi ${userData.nickname}!</strong><br>
            A password change has been requested for your account. If this was you, please use the link below to reset your password<br>
          </p>
          <a href="/" style="display:inline-block;text-decoration:none;background:#10a37f;border-radius:3px;color:white;font-family:Helvetica,sans-serif;font-size:16px;line-height:24px;font-weight:400;padding:12px 20px 11px;margin:0px; margin-bottom:10px" target="_blank" data-saferedirecturl="/">
            <span>Reset Password</span>        
          </a>
          <p style="font-size:16px;margin:0;margin-bottom:10px">
            If you did not make this request, your email address may have been entered by mistake and you can safely disregard this email. Visit your account settings page on HFG UI to update your information.
          </p>
          <p style="font-size:16px;margin:0">
            Thank you!<br>
            The HFG UI Team
          </p>
        </div>
      </body>
    </html>`,
  };

  transporter.sendMail(mailData, async function (err: any, _info: any) {
    if (err) {
      await forgotPasswordTokenDb.doc(tokenData.id).delete();
      return res.status(500).send({
        message: "Email failed to send",
      });
    } else {
      return res.status(200).send({
        message: "Password request success, check your email",
      });
    }
  });
};

export const verifyForgotPasswordTokenHandler = async (
  req: Request,
  res: Response
) => {
  const { token }: VerifyForgotPasswordDto = req.body;
  const forgotPasswordTokenDb = db.collection("forgot_password_token");
  const userDb = db.collection("user");

  const tokenData = await forgotPasswordTokenDb.doc(token).get();

  if (!tokenData.exists || !tokenData.data()) {
    return res.status(400).send({ message: "Token is not valid" });
  }

  const userId = tokenData.data()?.userId;
  const userData = await userDb.doc(userId).get();

  if (!userData.exists) {
    return res.status(400).send({
      message: `User with id ${userId} is not exist`,
    });
  }

  if (tokenData.data()?.expiry < Date.now() || !tokenData.data()?.active) {
    return res.status(400).send({
      message: "Token is expired or inactive",
    });
  }

  await forgotPasswordTokenDb
    .doc(tokenData.id)
    .set(
      { active: false, used_at: new Date(), updated_at: new Date() },
      { merge: true }
    );

  return res.status(200).send({ success: true, message: "Token is valid" });
};
