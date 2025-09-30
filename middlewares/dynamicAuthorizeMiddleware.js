import db from "../models/index.js";

export default function authorizeDynamic() {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      if (!admin?.id) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // SuperAdmin bypass
      if ((admin.roles || []).some(r => r.code.toUpperCase() === "SA")) {
        return next();
      }

      // Normalize route safely
      const method = req.method.toLowerCase();
      const path = req.baseUrl + req.path;  // ✅ safer than req.route.path
      console.log(method,"----------------------")
      console.log(path);
      

      // Lookup permission in DB
      const permission = await db.Permission.findOne({ where: { method, router: path } });
      if (!permission) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }

      // In-memory check
      if (!admin.permissionsSet.has(permission.id)) {
        return res.status(403).json({ success: false, message: "Forbidden: insufficient permission" });
      }

      next();
    } catch (err) {
      console.error("Authorization middleware error:", err);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}
