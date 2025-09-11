import jwt from "jsonwebtoken";
import db from "../models/index.js";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({success: false, message: "Authorization header missing or malformed" });
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({success: false, message: "No token provided in authMiddleware" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({success: false, message: "Invalid or expired token", error: error.message });
    }

    const admin = await db.Admin.findByPk(decoded.id);
    if (!admin) {
      return res.status(401).json({success: false, message: "admin not found" });
    }

    if (admin.remember_token !== token) {
      return res
        .status(401)
        .json({success: false, message: "Token mismatch. Please login again." });
    }

    // Case 2: admin inactive (status = 0)
    if (admin.status === false) {
      try {
        admin.remember_token = null;
        await admin.save();
      } catch (error) {
        res.json({success: false, message: "db update error", error: error.message });
      }
      return res.status(401).json({
        success: false,
        message: "Your account is inactive. Logged out automatically.",
      });
    }
    // ✅ Attach user info
    req.admin = admin;
    return next();
  } catch (error) {
    console.log(error);

    return res
      .status(401)
      .json({success: false, message: "authentication failed", error: error.message });
  }
};

export default authenticate;
