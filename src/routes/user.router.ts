import { Router } from "express";
import {
  loginUserHandler,
  registerUserHandler,
} from "../services/user.service";

const userRouter = Router();

userRouter.post("/user/login", loginUserHandler);

userRouter.post("/user/register", registerUserHandler);

export default userRouter;
