import db from "../models/index.js";

const checkAdminStatus = async (req, res, next) => {
  try {
    const adminId = req.admin?.id;
    if (!adminId) {
      return res
        .status(403)
        .json({ message: "Access denied, no adminId found" });
    }

    const admin = await db.Admin.findByPk(adminId, {
      attributes: ["id", "status"],
    });
    if (!admin) {
      return res.status(403).json({ message: "admin not found" });
    }

    if (admin.status === false || admin.status === null) {
      return res.status(403).json({
        message: "Your account is deactivated. Logged out automatically.",
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export default checkAdminStatus;
