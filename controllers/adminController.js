const bcrypt = require("bcryptjs");
const db = require("../models");

exports.addAdmin = async (req, res) => {
  try {
    const { username, email, phone, password, address, city, emp_id, status } =
      req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await db.Admin.create({
      username,
      email,
      phone,
      password: hashedPassword,
      emp_id,
      address,
      city,
      status: status ?? true,
    });

    res
      .status(201)
      .json({ message: "Admin created successfully", admin: newAdmin });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.assignRoleToAdmin = async (req, res) => {
  try {
    const { adminId, roleId } = req.body;

    const admin = await db.Admin.findByPk(adminId);
    const role = await db.Role.findByPk(roleId);

    if (!admin || !role) {
      return res.status(404).json({ message: "Admin or Role not found" });
    }

    await admin.addRole(role); // Sequelize magic method

    res.json({ message: `Role ${role.code} assigned to ${admin.username}` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.assignPermissionToRole = async (req, res) => {
  try {
    const { roleId, permissionId } = req.body;

    const role = await db.Role.findByPk(roleId);
    const permission = await db.Permission.findByPk(permissionId);

    if (!role || !permission) {
      return res.status(404).json({ message: "Role or Permission not found" });
    }

    await role.addPermission(permission); // Sequelize magic method

    res.json({
      message: `Permission ${permission.name} assigned to role ${role.code}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: "Name and Code are required" });
    }

    const existing = await db.Role.findOne({ where: { code } });
    if (existing) {
      return res.status(400).json({ message: "Role code already exists" });
    }

    const role = await db.Role.create({ name, code });
    res.status(201).json({ message: "Role created successfully", role });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 5️⃣ Create New Permission
exports.createPermission = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Permission name is required" });
    }

    const existing = await db.Permission.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ message: "Permission already exists" });
    }

    const permission = await db.Permission.create({ name });
    res
      .status(201)
      .json({ message: "Permission created successfully", permission });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
