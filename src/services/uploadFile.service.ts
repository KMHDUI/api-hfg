import { Storage } from "@google-cloud/storage";
import { Request, Response } from "express";

const storage = new Storage({
  projectId: process.env.PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS as string),
});

const bucket = storage.bucket(process.env.BUCKET_NAME as string);

export const uploadFileHandler = (req: Request, res: Response) => {
  try {
    if (req.file && req.body.folderName) {
      const folderName = req.body.folderName;
      const blob = bucket.file(
        `${folderName}/${new Date().getTime()}-${req.file.originalname}`
      );
      const blockStream = blob.createWriteStream();
      blockStream.on("finish", async (_e: any) => {
        const [url] = await blob.getSignedUrl({
          action: "read",
          expires: "2030-12-31",
        });
        res.status(200).json({ message: "Success upload file", url });
      });
      blockStream.end(req.file.buffer);
    } else {
      res.status(400).send("Bad request. Missing file or folderName.");
    }
  } catch (error) {
    res.status(500).send({ message: error });
  }
};
