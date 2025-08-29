const jwt = require("jsonwebtoken");
const { Admin } = require("../models");

const authenticate = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.split(" ")[1];

    if (!headerToken) {
      return res.status(401).json({ message: "No token provided in authMiddleware" });
    }
    let decoded;
    try {
      decoded = jwt.verify(headerToken, process.env.JWT_SECRET);
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Invalid or expired token", error: error.message });
    }

    const admin = await Admin.findByPk(decoded.id);
    if (!admin) {
      return res.status(401).json({ message: "admin not found" });
    }

    if (admin.remember_token !== headerToken) {
      return res
        .status(401)
        .json({ message: "Token mismatch. Please login again." });
    }

    // Case 2: admin inactive (status = 0)
    if (admin.status === false) {
      try {
        admin.remember_token = null;
        await admin.save();
      } catch (error) {
        res.json({ message: "db update error", error: error.message });
      }
      return res.status(401).json({
        message: "Your account is inactive. Logged out automatically.",
      });
    }
    console.log("Header token:", headerToken);
    console.log("DB token:", admin.remember_token);
    console.log("Status:", admin.status);

    // ✅ Attach user info
    req.admin = admin;
    return next();
  } catch (error) {
    console.log(error);

    return res
      .status(401)
      .json({ message: "authentication failed", error: error.message });
  }
};

module.exports = authenticate;
