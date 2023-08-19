import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/types";

const authentication = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).send({
      success: false,
      message: "Missing authorization header. Access denied.",
    });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res
      .status(401)
      .json({ message: "Invalid token format. Access denied." });
  }

  jwt.verify(
    token,
    String(process.env.JWT_SECRET),
    (err: any, decoded: any) => {
      if (err) {
        return res.status(403).send({ success: false, message: err.message });
      }
      req.userId = decoded.id;
      req.email = decoded.email;
      next();
    }
  );
};

export default authentication;
