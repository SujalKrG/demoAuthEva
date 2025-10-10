import jwt from "jsonwebtoken";
import db from "../models/index.js";
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Authorization header missing or malformed",
        });
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }
    console.log( "decoded info:---------------------------------",decoded);
    // Fetch admin along with roles & permissions in one query
    const admin = await db.Admin.findByPk(decoded.id, {
      attributes: ["id","name", "emp_id", "email", "status", "remember_token"],
      include: [
        {
          model: db.Role,
          as: "roles",
          attributes: ["id", "code"],
          through: { attributes: [] },
          include: [
            {
              model: db.Permission,
              as: "permissions",
              attributes: ["id", "name"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!admin)
      return res
        .status(401)
        .json({ success: false, message: "Admin not found" });

    // if (admin.remember_token && admin.remember_token !== token) {
    //   return res
    //     .status(401)
    //     .json({
    //       success: false,
    //       message: "Token mismatch. Please login again.",
    //     });
    // }

    if (!admin.status)
      return res
        .status(401)
        .json({
          success: false,
          message: "Your account is inactive. Please contact support.",
        });

    // Precompute permission set for faster authorization
    const permissionSet = new Set();
    (admin.roles || []).forEach((r) =>
      (r.permissions || []).forEach((p) => permissionSet.add(p.id))
    );
    // console.log("--------------------------------------------");
    // console.log({ ...admin.get(), permissionsSet: permissionSet} );
    
    
    req.admin = { ...admin.get(), permissionsSet: permissionSet };

    next();
  } catch (err) {
    console.error("[authenticate] error:", err);
    return res
      .status(401)
      .json({
        success: false,
        message: "Authentication failed",
        error: err.message,
      });
  }
};

export default authenticate;
