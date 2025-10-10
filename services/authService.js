import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findAdminByEmail,
  findAdminById,
  saveAdmin,
  findAdminById1,
} from "../repositories/authRepository.js";
// import logActivity from "../utils/logActivity.js";
import { generateToken } from "../utils/requiredMethods.js";


export const loginService = async ({ email, password }) => {
  if (!email || !password) throw new Error("Email and password are required");

  const admin = await findAdminByEmail(email);
  if (!admin) throw new Error("Invalid email or password");
  if (!admin.status)
    throw new Error("Account is inactive, contact super admin");

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw new Error("Invalid email or password");

  const roles = admin.roles.map((r) => r.code);
  const permissions = admin.roles.flatMap((r) =>
    r.permissions.map((p) => p.name)
  );

  const accessToken = generateToken({
    id: admin.id,
    email: admin.email,
    roles,
    // permissions,
  });
  // admin.remember_token = accessToken;
  // await saveAdmin(admin);

  // await logActivity({
  //   created_by: admin.id,
  //   action: "LOGIN",
  //   module: "Admin",
  //   details: {},
  // });
  return { admin, accessToken };
};

export const logoutService = async (token) => {
  if (!token) return "Logout successful (no token)";

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") decoded = jwt.decode(token);
    else return "Logout successful (invalid token)";
  }

  if (!decoded?.id) return "Logout successful (no user id)";

  // const admin = await findAdminById(decoded.id);
  // if (admin && admin.remember_token === token) {
  //   admin.remember_token = null;
  //   await saveAdmin(admin);
  // }

  return "Logout successful";
};

export const changePasswordService = async ({
  adminId,
  currentPassword,
  newPassword,
}) => {
  if (!currentPassword || !newPassword)
    throw new Error("Current and new passwords are required");
  if (currentPassword === newPassword)
    throw new Error("New password must be different from current password");
  if (newPassword.length < 6)
    throw new Error("New password must be at least 6 characters long");

  const admin = await findAdminById(adminId);
  if (!admin) throw new Error("Admin not found");

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) throw new Error("Current password is incorrect");

  const hashed = await bcrypt.hash(newPassword, 10);
  admin.password = hashed;
  await saveAdmin(admin);

  return "Password changed successfully";
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
