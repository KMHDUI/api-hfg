import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "./utils/logger";
import userRouter from "./routes/user.router";
import { initializeFirestore } from "./database/firestore";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerOptions from "../swagger.json";
import prodSwaggerOptions from "../swagger-prod.json";
import swaggerUi from "swagger-ui-express";
import competitionRouter from "./routes/competition.router";
import paymentRouter from "./routes/payment.router";
import uploadFileRouter from "./routes/uploadFile.router";

dotenv.config();
initializeFirestore();

const app: Express = express();
const port = process.env.NODE_PORT || 8000;
const env = process.env.NODE_ENV;
const CSS_URL =
  "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css";

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("API HFG UI");
});

app.use("/api/v1/user", userRouter);
app.use("/api/v1/competition", competitionRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/upload", uploadFileRouter);

const spec: object = swaggerJSDoc(
  env === "prod" || env === "dev" ? prodSwaggerOptions : swaggerOptions
);
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(spec, { customCssUrl: CSS_URL })
);

app.listen(port, () => {
  logger.info(`⚡️[server]: Server is running at http://localhost:${port}`);
});
