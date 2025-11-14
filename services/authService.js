import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { Admin } = db;
import {
  findAdminByEmail,
  findAdminById,
  saveAdmin,
  findAdminById1,
} from "../repositories/authRepository.js";
// import logActivity from "../utils/logActivity.js";
import { generateToken } from "../utils/requiredMethods.js";
import AppError from "../utils/AppError.js";

export const loginService = async ({ email, password }) => {
  if (!email || !password)
    throw new AppError("Email and password are required");

  const admin = await findAdminByEmail(email);
  if (!admin) throw new AppError("Invalid email or password");
  if (!admin.status)
    throw new Error("Account is inactive, contact super admin");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new AppError("incorrect password", 401);
  if (admin.reset_password_otp_expire) {
    if (new Date() > new Date(admin.reset_password_otp_expire)) {
      throw new AppError(
        "Temporary password expired. Contact your super admin.",
        401
      );
    }
  }
  const roles = admin.roles.map((r) => r.code);
  const permissions = admin.roles.flatMap((r) =>
    r.permissions.map((p) => p.name)
  );
  const tokenData = { id: admin.id, email: admin.email, roles };
  const token = jwt.sign(tokenData, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  // Store token so logout can invalidate it
  admin.remember_token = token;
  await admin.save();

  return { admin, token };
};

export const logoutService = async (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded?.id) return "Logout successful";

    const admin = await Admin.findByPk(decoded.id);
    if (!admin) return "Logout successful";

    admin.remember_token = null;
    await admin.save();
  } catch (err) {
    // Ignore logout errors
  }

  return "Logout successful";
};

export const getProfileService = async (adminId) => {
  const admin = await findAdminById1(adminId);

  if (!admin) {
    throw new Error("Admin not found");
  }

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    emp_id: admin.emp_id,
    phone_number: admin.phone_number,
    status: admin.status,
    roles: admin.roles || [],
    permissions: admin.roles?.flatMap((role) => role.permissions) || [],
  };
};
