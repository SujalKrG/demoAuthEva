import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/superAdmin/superAdminRouter.js";
import { sequelize, remoteSequelize } from "./models/index.js";

const app = express();
const PORT = process.env.PORT;
app.use(express.json({ limit: "1mb" })); // Prevents huge payloads

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/", authRouter);
app.use("/api/v1/", adminRouter);
// app.use("/api/v1/", adminRouter);

async function testDBConnections() {
  try {
    await sequelize.authenticate();
    console.log("Local DB connection established successfully.");

    await remoteSequelize.authenticate();
    console.log("Remote DB connection established successfully.");
  } catch (error) {
    console.error("Unable to connect to the databases:", error);
  }
}

app.listen(PORT, async () => {
  console.log("Server running on port", PORT);
  await testDBConnections();
});
