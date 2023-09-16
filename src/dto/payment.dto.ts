/**
 * @openapi
 * components:
 *   schemas:
 *     PaymentDto:
 *       type: object
 *       properties:
 *         billId:
 *           type: string
 *           description: The ID associated with the bill.
 *         imageUrl:
 *           type: string
 *           description: The URL to the bill's image.
 *       required:
 *         - billId
 *       example:
 *         billId: "BILL123"
 *         imageUrl: "https://example.com/bill-image.jpg"
 */
export interface PaymentDto {
  billId: string;
  imageUrl?: string;
}

/**
 * @openapi
 * components:
 *   schemas:
 *     CancelPaymentDto:
 *       type: object
 *       properties:
 *         paymentId:
 *           type: string
 *           description: The ID of the payment to be canceled.
 *       required:
 *         - paymentId
 *       example:
 *         paymentId: "PAYMENT123"
 */
export interface CancelPaymentDto {
    paymentId: string
}
