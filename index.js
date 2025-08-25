const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRouter = require("./routes/authRoutes");
const adminRouter = require("./routes/superAdminRouter");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
