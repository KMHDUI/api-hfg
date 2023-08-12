import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

const secret = String(process.env.JWT_SECRET);

const generateJwtToken = (payload: any) => {
  return jwt.sign(payload, secret, { expiresIn: 60 * 60 * 24 * 365 }); //expiredIn 1 year
};

export default generateJwtToken;
