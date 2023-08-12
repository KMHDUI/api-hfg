import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "./utils/logger";
import userRouter from "./routes/user.router";
import { initializeFirestore } from "./database/firestore";

dotenv.config();
initializeFirestore();

const app: Express = express();
const port = process.env.PORT || 8000;

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/api", (_req: Request, res: Response) => {
  res.send("API HFG UI");
});

app.use("/api/v1", userRouter);

app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
});
