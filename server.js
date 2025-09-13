import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";

import authRouter from "./routes/authRoutes.js";
import adminRouter from "./routes/index.js";
import { sequelize, remoteSequelize } from "./models/index.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json({ limit: "16kb" })); // Prevents huge payload
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/v1/", authRouter);
app.use("/api/v1/", adminRouter);
// app.use("/api/v1/", adminRouter);
console.log("DB1 config:", sequelize.config);
console.log("DB2 config:", remoteSequelize.config);

//db test
async function testDBConnections() {
  try {
    await sequelize.authenticate();
    console.log("Local DB connection established successfully.");

    await remoteSequelize.authenticate();
    console.log("Remote DB connection established successfully.");

    // redisClient.connect();
  } catch (error) {
    console.error("Unable to connect to the databases:", error);
    process.exit(1);
  }
}
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).json({ error: "something went wrong" });
});

app.listen(PORT, "0.0.0.0", async () => {
  console.log("Server running on port", PORT);
  await testDBConnections();
});
