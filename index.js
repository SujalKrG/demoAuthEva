const express = require("express");

const router = require("./routes/authRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;


app.use(express.json());
app.use("/api/v1",router)

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
