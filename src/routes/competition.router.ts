import { Router } from "express";
import {
  changeMemberStatusHandler,
  getAllCompetitionHandler,
  getCompetitionDetailHandler,
  getMyCompetitionHandler,
  joinGroupCompetitionByCodeHandler,
  registerCompetitionHandler,
  submitSubmissionHandler,
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
 *   /api/v1/competition/submit:
 *     post:
 *       tags: [Competition]
 *       summary: Submit a competition entry.
 *       security:
 *         - bearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmitSubmissionDto'
 *       responses:
 *         200:
 *           description: Submission was successful.
 *         400:
 *           description: Bad request. Invalid input data.
 *         401:
 *           description: Unauthorized. Authentication required.
 *         500:
 *           description: Internal server error.
 */
competitionRouter.post("/submit", authentication, submitSubmissionHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/competition/member/status:
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
  "/member/status",
  authentication,
  changeMemberStatusHandler
);

/**
 * @openapi
 * paths:
 *   /api/v1/competition/{code}:
 *     get:
 *       tags: [Competition]
 *       summary: Retrieve details for a competition by its code.
 *       security:
 *         - bearerAuth: []
 *       parameters:
 *         - in: path
 *           name: code
 *           schema:
 *             type: string
 *           required: true
 *           description: The code of the competition to retrieve details for.
 *       responses:
 *         200:
 *           description: Successful retrieval of competition details.
 *         400:
 *           description: Bad request. Invalid input data.
 *         401:
 *           description: Unauthorized. Authentication required.
 *         500:
 *           description: Internal server error.
 */
competitionRouter.get("/:code", authentication, getCompetitionDetailHandler);

export default competitionRouter;
