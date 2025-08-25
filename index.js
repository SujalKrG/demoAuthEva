const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const router = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1", router);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
