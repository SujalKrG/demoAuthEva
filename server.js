import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/index.js";
import { sequelize, remoteSequelize } from "./models/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

dotenv.config();

const requiredEnvVars = ["PORT", "FRONTEND_URL"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing environment variable: ${envVar}`);
    process.exit(1);
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" })); // Prevents huge payload
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "'https'", "'http'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = [process.env.FRONTEND_URL];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      else return callback(new Error("Not allowed by CORS"));
    },

    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);

app.use("/api/v1/", authRouter);
app.use("/api/v1/", adminRouter);
// app.use("/api/v1/", adminRouter);
// console.log("DB1 config:", sequelize.config);
// console.log("DB2 config:", remoteSequelize.config);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal Server Error";

  console.error(`🔥 ${req.method} ${req.originalUrl} → ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
  });
});
app.use(errorHandler);

//db test
async function testDBConnections() {
  const checkDB = async (db, name) => {
    try {
      await db.authenticate();
      console.log(`${name} DB connection established successfully.`);
    } catch (error) {
      console.error(`${name} DB connection error:`, error.message);
    }
  };
  await Promise.all([
    checkDB(sequelize, "Main"),
    checkDB(remoteSequelize, "Remote"),
  ]);
}
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log("Server running on port", PORT);
  await testDBConnections();
});
