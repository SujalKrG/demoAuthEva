// middleware/requestLogger.js
import db from "../models/index.js";

export const requestLogger = async (req, res, next) => {
  res.on("finish", async () => {
    try {
      if (!req.admin) return; // only log authenticated admins
      
    } catch (err) {
      console.error("Request logging error:", err);
    }
  });

  next();
};
