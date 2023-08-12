import { Router } from "express";
import {
  loginUserHandler,
  registerUserHandler,
} from "../services/user.service";

/**
 * @openapi
 * tags:
 *   name: User
 *   description: User authentication and registration
 */
const userRouter = Router();

/**
 * @openapi
 * paths:
 *   /api/v1/user/login:
 *     post:
 *       tags: [User]
 *       summary: Authenticate a user.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginUserDto'
 *       responses:
 *         200:
 *           description: Successfully authenticated.
 *         400:
 *           description: Invalid credentials.
 *         500:
 *           description: Internal server error.
 */
userRouter.post("/user/login", loginUserHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/user/register:
 *     post:
 *       tags: [User]
 *       summary: Register a new user.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterUserDto'
 *       responses:
 *         201:
 *           description: User registered successfully.
 *         400:
 *           description: Invalid input or user already exists.
 *         500:
 *           description: Internal server error.
 */
userRouter.post("/user/register", registerUserHandler);

export default userRouter;
