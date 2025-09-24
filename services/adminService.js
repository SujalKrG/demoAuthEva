import bcrypt from "bcryptjs";
import db from "../models/index.js";
import { sequelize } from "../models/index.js";
import {
  findAdminByEmail,
  createAdmin,
  findRoleByCodes,
  findAdminByIdWithRoles,
  findAllAdmins,
  findAdminById,
  findAdminWithRoleAndPermissions,
  findAdminById2,
  updateAdmin,
  updateAdminRoles,
  updateAdminStatus,
} from "../repositories/adminRepository.js";

const validationError = async (t, message) => {
  if (t) await t.rollback();
  throw new Error(message);
};

const generateEmpId = async (t) => {
  const year = new Date().getFullYear().toString().slice(-2); // "25"

  // Find last created admin for this year
  const lastAdmin = await db.Admin.findOne({
    where: sequelize.where(
      sequelize.fn("substring", sequelize.col("emp_id"), 4, 2), // extract year part from EMP<YY>
      year
    ),
    order: [["created_at", "DESC"]],
    transaction: t,
    lock: t.LOCK.UPDATE,
  });

  let sequence = 1;
  if (lastAdmin?.emp_id) {
    // Get numeric sequence part from EMP<YY><SEQ>
    const lastSeq = parseInt(lastAdmin.emp_id.slice(6), 10); // slice after EMPYY
    if (!isNaN(lastSeq)) {
      sequence = lastSeq + 1;
    }
  }

  const paddedSeq = String(sequence).padStart(3, "0");
  return `EMP${year}${paddedSeq}`;
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
    const emp_id = await generateEmpId(t);

    const newAdmin = await createAdmin(
      {
        name: name.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password: hashedPassword,
        emp_id,
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


export const getAdminWithRoleAndPermissionsService = async (filters) => {
  try {
    const admins = await findAdminWithRoleAndPermissions(filters);

    if (!admins || admins.length === 0) {
      throw new Error("Admin not found");
    }

    return admins.map((admin) => ({
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
  } catch (error) {
    throw new Error(`Service error: ${error.message}`);
  }
};

export const updateAdminService = async (id, data) => {
  const t = await sequelize.transaction();
  try {
    const { roles, ...adminData } = data;

    // ✅ Update admin basic fields
    const [_, updatedAdmin] = await updateAdmin(id, adminData, t);

    if (!updatedAdmin) {
      await t.rollback();
      return null;
    }

    // ✅ Update roles if provided
    if (roles && Array.isArray(roles)) {
      await updateAdminRoles(id, roles, t);
    }

    await t.commit();

    return await findAdminById2(id);
  } catch (error) {
    await t.rollback();
    throw error;
  }
};

export const updateAdminStatusService = async (id, status) => {
  const t = await sequelize.transaction();
  try {
    // validate status (must be boolean or 0/1)
    if (status === undefined || status === null) {
      throw new Error("Status is required");
    }

    const normalizedStatus =
      status === true || status === "true" || status === 1 || status === "1";

    const [_, updatedAdmin] = await updateAdminStatus(id, normalizedStatus, t);

    if (!updatedAdmin) {
      await t.rollback();
      return null;
    }

    await t.commit();

    // fetch fresh admin with roles for response
    return await db.Admin.findByPk(id, {
      include: [{ model: db.Role, as: "roles" }],
    });
  } catch (error) {
    await t.rollback();
    throw error;
  }
};
