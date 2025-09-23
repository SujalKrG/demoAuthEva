import bcrypt from "bcryptjs";
import { sequelize } from "../models/index.js";
import {
  findAdminByEmail,
  createAdmin,
  findRoleByCodes,
  findAdminByIdWithRoles,
  findAllAdmins,
  findAdminById,
  findAdminWithRoleAndPermissions,
} from "../repositories/adminRepository.js";

const validationError = async (t, message) => {
  if (t) await t.rollback();
  throw new Error(message);
};

export const addAdminService = async (data) => {
  const t = await sequelize.transaction();
  try {
    const { name, email, phone, address, city, status, password, roles } = data;

    if (![name, email, phone, address, city].every(Boolean)) {
      return validationError(t, "All fields are required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (await findAdminByEmail(normalizedEmail, t)) {
      return validationError(t, "Email already exists");
    }

    if (!password || password.length < 6) {
      return validationError(t, "Password must be at least 6 characters long");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await createAdmin(
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        // emp_id: emp_id.trim(),
        address: address.trim(),
        city: city.trim(),
        status: status ?? true,
      },
      t
    );

    if (Array.isArray(roles) && roles.length > 0) {
      const uniqueRoles = [
        ...new Set(roles.map((r) => r.trim().toUpperCase())),
      ];
      const foundRoles = await findRoleByCodes(uniqueRoles, t);

      if (foundRoles.length !== uniqueRoles.length) {
        return validationError(t, "One or more roles are invalid");
      }

      await newAdmin.addRoles(foundRoles, { transaction: t });
    }

    await t.commit();
    return await findAdminByIdWithRoles(newAdmin.id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const getAllAdminsService = async () => findAllAdmins();

export const getAdminByIdService = async (id) => {
  const admin = await findAdminById(id);
  if (!admin) throw new Error("Admin not found");
  return admin;
};

export const getAdminWithRoleAndPermissionsService = async () => {
  const admin = await findAdminWithRoleAndPermissions();
  if (!admin) throw new Error("Admin not found");

  return admin.map((admin) => ({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    address: admin.address,
    city: admin.city,
    emp_id: admin.emp_id,
    status: admin.status,
    roles: admin.roles.map((role) => ({
      id: role.id,
      name: role.name,
      code: role.code,
      permissions: role.permissions.map((p) => p.name),
    })),
  }));
};
