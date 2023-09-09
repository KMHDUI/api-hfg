/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterCompetitionDto:
 *       type: object
 *       properties:
 *         competitionId:
 *           type: string
 *           description: The ID of the competition to register for.
 *       required:
 *         - competitionId
 *       example:
 *         competitionId: "COMP123"
 */
export interface RegisterCompetitionDto {
  competitionId: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     JoinGroupCompetitionByCodeDto:
 *       type: object
 *       properties:
 *         competitionId:
 *           type: string
 *           description: The ID of the competition to join.
 *         code:
 *           type: string
 *           description: The group code to join the competition.
 *       required:
 *         - competitionId
 *         - code
 *       example:
 *         competitionId: "COMP123"
 *         code: "GROUP456"
 */
export interface JoinGroupCompetitionByCodeDto {
  competitionId: string;
  code: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     ChangeMemberStatusDto:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: The code associated with the team or group.
 *         memberId:
 *           type: string
 *           description: The ID of the member whose status is being changed.
 *         status:
 *           type: string
 *           enum:
 *             - Deleted
 *             - Accepted
 *             - Rejected
 *           description: The new status for the member (Deleted, Accepted, or Rejected).
 *       required:
 *         - code
 *         - memberId
 *         - status
 *       example:
 *         code: "TEAM123"
 *         memberId: "MEMBER456"
 *         status: "Accepted"
 */
export interface ChangeMemberStatusDto {
  code: string;
  memberId: string;
  status: "Deleted" | "Accepted" | "Rejected";
}
