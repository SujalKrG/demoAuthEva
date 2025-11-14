import jwt from "jsonwebtoken";
import db from "../models/index.js";
import AppError from "../utils/AppError.js";
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Invalid authorization header", 401);
    }

    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new AppError("Invalid token", 401);
    }
    // console.log( "decoded info:---------------------------------",decoded);
    // Fetch admin along with roles & permissions in one query
    const admin = await db.Admin.findByPk(decoded.id, {
      attributes: ["id", "name", "emp_id", "email","password", "status", "remember_token"],
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

    if (!admin) throw new AppError("admin not found", 401);

    if (!admin.status)
      throw new AppError("Account is inactive, contact super admin", 401);

    if (admin.remember_token !== token)
      throw new AppError("session expired, please login again.", 401);

    // Precompute permission set for faster authorization
    const permissionSet = new Set();
    (admin.roles || []).forEach((r) =>
      (r.permissions || []).forEach((p) => permissionSet.add(p.id))
    );
    // console.log("--------------------------------------------");
    // console.log({ ...admin.get(), permissionsSet: permissionSet} );

    req.admin = admin;
    req.admin.permissionsSet = permissionSet;

    next();
  } catch (err) {
    next(err);
  }
};

export default authenticate;
