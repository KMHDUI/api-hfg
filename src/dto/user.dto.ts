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
 *         email: user@example.com
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
 *         phone: +1234567890
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
