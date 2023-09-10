import { Router } from "express";
import Multer from "multer";
import { uploadFileHandler } from "../services/uploadFile.service";

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

/**
 * @openapi
 * tags:
 *   name: Upload
 *   description: Handlers for file uploads
 */
const uploadFileRouter = Router();

/**
 * @openapi
 * paths:
 *   /api/v1/upload:
 *     post:
 *       tags: [Upload]
 *       summary: Upload a file.
 *       requestBody:
 *         required: true
 *         content:
 *           multipart/form-data:
 *             schema:
 *               type: object
 *               properties:
 *                 folderName:
 *                   type: string
 *                 file:
 *                   type: string
 *                   format: binary
 *       responses:
 *         200:
 *           description: File uploaded successfully.
 *         400:
 *           description: Bad request. Invalid input data.
 *         500:
 *           description: Internal server error.
 */
uploadFileRouter.post("/", [multer.single("file")], uploadFileHandler);

export default uploadFileRouter;
