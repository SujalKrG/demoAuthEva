import db from "../../models/index.js";

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