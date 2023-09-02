import { Router } from "express";
import {
  cancelPaymentHandler,
  paymentHandler,
} from "../services/payment.service";
import authentication from "../middleware/authencation";

/**
 * @openapi
 * tags:
 *   name: Payment
 *   description: Handlers for payment processing
 */
const paymentRouter = Router();

/**
 * @openapi
 * paths:
 *   /api/v1/payment/pay:
 *     post:
 *       tags: [Payment]
 *       summary: Process a payment.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentDto'
 *       responses:
 *         200:
 *           description: Payment processed successfully.
 *         400:
 *           description: Bad request, invalid input data.
 *         500:
 *           description: Internal server error.
 */
paymentRouter.post("/pay", authentication, paymentHandler);

/**
 * @openapi
 * paths:
 *   /api/v1/payment/cancel:
 *     post:
 *       tags: [Payment]
 *       summary: Cancel a payment.
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CancelPaymentDto'
 *       responses:
 *         200:
 *           description: Payment canceled successfully.
 *         400:
 *           description: Bad request, invalid input data.
 *         500:
 *           description: Internal server error.
 */
paymentRouter.post("/cancel", authentication, cancelPaymentHandler);

export default paymentRouter;
