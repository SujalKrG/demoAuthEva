import { HasMany } from "sequelize";
import db from "../models/index.js";
import { match } from "path-to-regexp"; // ✅ npm install path-to-regexp

const defaultPermissions = [
  { method: "get", router: "/api/v1/get-profile" },
  { method: "post", router: "/api/v1/login" },
  { method: "get", router: "/api/v1/logout" },
  { method: "post", router: "/api/v1/request-password-otp" },
  { method: "post", router: "/api/v1/reset-password-otp" },
  { method: "post", router: "/api/v1/get-occasion" },
  { method: "get", router: "/api/v1/country/get" },
  { method: "get", router: "/api/v1/theme-category/get" },
  { method: "get", router: "/api/v1/admin-activity-log/get" },
  { method: "get", router: "/api/v1/admin-activity-log/:module/:id" },
  { method: "get", router: "/api/v1/cart-summary/get" },
];

export default function authorizeDynamic() {
  return async (req, res, next) => {
    try {
      const admin = req.admin;
      if (req.path.startsWith("/webhook")) {
        return next();
      }
      if (!admin?.id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized access" });
      }

      // Normalize request info
      const method = req.method.toLowerCase();
      const path = req.baseUrl + req.path;

      // SuperAdmin bypass
      if ((admin.roles || []).some((r) => r.code.toUpperCase() === "SA")) {
        return next();
      }

      // ✅ Check default permissions (with path-to-regexp support)
      const isDefaultAllowed = defaultPermissions.some((p) => {
        if (p.method !== method) return false;
        const matcher = match(p.router, { decode: decodeURIComponent });
        return matcher(path) !== false;
      });

      if (isDefaultAllowed) {
        return next();
      }

      // DB lookup
      const permission = await db.Permission.findOne({
        where: { method, router: path },
      });

      if (!permission) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }

      // In-memory check
      if (!admin.permissionsSet.has(permission.id)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: insufficient permission",
        });
      }

      next();
    } catch (err) {
      console.error("Authorization middleware error:", err);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };
}
