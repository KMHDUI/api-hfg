import { Router } from "express";
import {
  changeMemberStatusHandler,
  getAllCompetitionHandler,
  getMyCompetitionHandler,
  joinGroupCompetitionByCodeHandler,
  registerCompetitionHandler,
} from "../services/competition.service";
import authentication from "../middleware/authencation";

/**
 * @openapi
 * tags:
 *   name: Competition
 *   description: Handler for competition
 */
const competitionRouter = Router();

/**
 * @openapi
 * paths:
 *   /api/v1/competition:
 *     get:
 *       tags: [Competition]
 *       summary: Retrieve all competitions.
 *       responses:
 *         200:
 *           description: Successful retrieval of all competitions.
 *         500:
 *           description: Internal server error.
 */
competitionRouter.get("/", getAllCompetitionHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/competition/me:
 *     get:
 *       tags: [Competition]
 *       summary: Retrieve competitions associated with the authenticated user.
 *       responses:
 *         200:
 *           description: Successful retrieval of competitions for the authenticated user.
 *         401:
 *           description: Unauthorized, user not authenticated.
 *         500:
 *           description: Internal server error.
 */
competitionRouter.get("/me", authentication, getMyCompetitionHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/competition/register:
 *     post:
 *       tags: [Competition]
 *       summary: Register for a competition.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterCompetitionDto'
 *       responses:
 *         200:
 *           description: Registration for the competition was successful.
 *         400:
 *           description: Bad request. Invalid input data.
 *         401:
 *           description: Unauthorized. Authentication required.
 *         500:
 *           description: Internal server error.
 */
competitionRouter.post("/register", authentication, registerCompetitionHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/competition/register-by-code:
 *     post:
 *       tags: [Competition]
 *       summary: Register for a competition using a group code.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JoinGroupCompetitionByCodeDto'
 *       responses:
 *         200:
 *           description: Registration for the competition using a group code was successful.
 *         400:
 *           description: Bad request. Invalid input data.
 *         401:
 *           description: Unauthorized. Authentication required.
 *         500:
 *           description: Internal server error.
 */
competitionRouter.post(
  "/register-by-code",
  authentication,
  joinGroupCompetitionByCodeHandler
);

/**
 * @openapi
 * paths:
 *   /api/v1/competition/register-by-code/status:
 *     patch:
 *       tags: [Competition]
 *       summary: Change the status of a member in a competition group using a group code.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChangeMemberStatusDto'
 *       responses:
 *         200:
 *           description: Member status changed successfully.
 *         400:
 *           description: Bad request. Invalid input data.
 *         401:
 *           description: Unauthorized. Authentication required.
 *         500:
 *           description: Internal server error.
 */
competitionRouter.patch(
  "/register-by-code/status",
  authentication,
  changeMemberStatusHandler
);

competitionRouter.put(
  "/register-by-code/status",
  authentication,
  changeMemberStatusHandler
);

export default competitionRouter;
