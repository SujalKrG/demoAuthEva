import bcrypt from "bcryptjs";
import db from "../../models/index.js";

//admin controller (super admin only)
export const addAdmin = async (req, res) => {
  try {
    const { password } = req.body;

    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const phone = req.body.phone?.trim();
    const address = req.body.address?.trim();
    const city = req.body.city?.trim();
    const emp_id = req.body.emp_id?.trim();
    const status = req.body.status;

    if (!name || !email || !phone || !address || !city || !emp_id) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }



    const emailExists = await db.Admin.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await db.Admin.create({
      name,
      email,
      phone,
      password: hashedPassword,
      emp_id,
      address,
      city,
      status: status ?? true,
    });

    const { password: _, ...adminData } = newAdmin.get({ plain: true });

    res
      .status(201)
      .json({ message: "Admin created successfully", admin: adminData });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Assign Role to Admin controller(super admin only)
export const assignRoleToAdmin = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { adminId, roleId } = req.body;

    const admin = await db.Admin.findByPk(adminId, { transaction: t });
    const role = await db.Role.findByPk(roleId, { transaction: t });

    if (!admin || !role) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Admin or Role not found" });
    }

    const alreadyHasRole = await admin.hasRole(role, { transaction: t });
    if (alreadyHasRole) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Admin already has this role" });
    }

    await admin.addRole(role, { transaction: t }); // Sequelize magic method
    await t.commit();

    res.json({ message: `Role ${role.code} assigned to ${admin.name}` });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Assign Permission to Role controller(super admin only)
export const assignPermissionToRole = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const { roleId, permissionId } = req.body;

    const role = await db.Role.findByPk(roleId, { transaction: t });
    const permission = await db.Permission.findByPk(permissionId, {
      transaction: t,
    });

    if (!role || !permission) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Role or Permission not found" });
    }

    const alreadyHasPermission = await role.hasPermission(permission, {
      transaction: t,
    });
    if (alreadyHasPermission) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Role already has this permission" });
    }

    await role.addPermission(permission, { transaction: t }); // Sequelize magic method
    await t.commit();

    res.json({
      message: `Permission ${permission.name} assigned to role ${role.code}`,
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create New Role controller (super admin only)
export const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const code = req.body.code?.trim().toUpperCase();

    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Name and Code are required" });
    }

    const existing = await db.Role.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Role code already exists" });
    }

    const role = await db.Role.create({ name, code });
    res.status(201).json({ success: true, message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create New Permission controller (super admin only)
export const createPermission = async (req, res) => {
  try {
    const name = req.body.name?.trim().toLowerCase();

    if (!name) {
      return res.status(400).json({ success: false, message: "Permission name is required" });
    }

    const existing = await db.Permission.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, message: "Permission already exists" });
    }

    const permission = await db.Permission.create({ name });
    res
      .status(201)
      .json({ success: true, message: "Permission created successfully", permission });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
