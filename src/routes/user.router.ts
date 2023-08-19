import { Router } from "express";
import {
  getMyProfileHandler,
  loginUserHandler,
  registerUserHandler,
  verificationUserHandler,
} from "../services/user.service";
import authentication from "../middleware/authencation";

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
userRouter.post("/login", loginUserHandler);

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
userRouter.post("/register", registerUserHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/user/verification:
 *     post:
 *       tags: [User]
 *       summary: Verify user identity.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerificationUserDto'
 *       responses:
 *         200:
 *           description: Verification successful
 */
userRouter.post("/verification", authentication, verificationUserHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/user/profile:
 *     get:
 *       tags: [User]
 *       summary: Get the user's profile.
 *       responses:
 *         200:
 *           description: Successful retrieval of user profile.
 */
userRouter.get("/profile", authentication, getMyProfileHandler);

export default userRouter;
