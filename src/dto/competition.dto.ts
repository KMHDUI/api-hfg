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
