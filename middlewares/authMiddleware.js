const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.trim().split(" ")[1]; //Bearer token

    if (!token) {
      return res.status(401).json({ message: "Invalid token format", });
    }

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //attach user info to req
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired",error });
    } else {
      return res.status(401).json({ message: "Unauthorized",error });
    }
  }
};

module.exports = authenticate;
