/**
 * @openapi
 * components:
 *   schemas:
 *     LoginUserDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user.
 *         password:
 *           type: string
 *           description: The password of the user.
 *       required:
 *         - email
 *         - password
 *       example:
 *         email: john@example.com
 *         password: secret123
 */
export interface LoginUserDto {
  email: string;
  password: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     RegisterUserDto:
 *       type: object
 *       properties:
 *         fullname:
 *           type: string
 *           description: The full name of the user.
 *         nickname:
 *           type: string
 *           description: The nickname of the user.
 *         email:
 *           type: string
 *           description: The email of the user.
 *         phone:
 *           type: string
 *           description: The phone number of the user.
 *         password:
 *           type: string
 *           description: The password of the user.
 *         status:
 *           type: string
 *           description: The status of the user.
 *         college:
 *           type: string
 *           description: The college of the user.
 *       required:
 *         - fullname
 *         - nickname
 *         - email
 *         - phone
 *         - password
 *         - status
 *         - college
 *       example:
 *         fullname: John Doe
 *         nickname: johnd
 *         email: john@example.com
 *         phone: "082147474931"
 *         password: secret123
 *         status: active
 *         college: University XYZ
 */
export interface RegisterUserDto {
  fullname: string;
  nickname: string;
  email: string;
  phone: string;
  password: string;
  status: string;
  college: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     VerificationUserDto:
 *       type: object
 *       properties:
 *         major:
 *           type: string
 *           description: The major of the user.
 *         batch:
 *           type: number
 *           description: The batch of the user.
 *         bod:
 *           type: string
 *           format: date
 *           description: The date of birth of the user (in ISO 8601 format).
 *         sn:
 *           type: string
 *           description: The serial number of the user.
 *         snUrl:
 *           type: string
 *           format: uri
 *           description: The URL to the serial number image.
 *         haloBelanjaUrl:
 *           type: string
 *           format: uri
 *           description: The URL to the Halo Belanja image.
 *       required:
 *         - major
 *         - batch
 *         - bod
 *         - sn
 *         - snUrl
 *         - haloBelanjaUrl
 *       example:
 *         major: "Computer Science"
 *         batch: 2023
 *         bod: "2000-08-15"
 *         sn: "SN12345"
 *         snUrl: "https://example.com/sn-image.jpg"
 *         haloBelanjaUrl: "https://example.com/halo-belanja-image.jpg"
 */
export interface VerificationUserDto {
  major: string;
  batch: number;
  bod: Date;
  sn: string;
  snUrl: string;
  haloBelanjaUrl: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     ChangePasswordDto:
 *       type: object
 *       properties:
 *         oldPassword:
 *           type: string
 *           description: The user's old password.
 *         newPassword:
 *           type: string
 *           description: The user's new password.
 *       required:
 *         - oldPassword
 *         - newPassword
 *       example:
 *         oldPassword: "currentPassword"
 *         newPassword: "newPassword123"
 */
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     ForgotPasswordDto:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The email of the user requesting a password reset.
 *       required:
 *         - email
 *       example:
 *         email: "user@example.com"
 */
export interface ForgotPasswordDto {
  email: string;
}
