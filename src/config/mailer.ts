import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  port: 465,
  host: "smtp.gmail.com",
  auth: {
    user: String(process.env.EMAIL_USER),
    pass: String(process.env.EMAIL_PASSWORD),
  },
  secure: true,
});

export default transporter;
