import { assignPermissionToRoleService } from "../services/rolePermissionService.js";

export const assignPermissionToRole = async (req, res) => {
  try {
    const result = await assignPermissionToRoleService(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    logger.error(`[permission to role][assign] ${error.message}`, {
         name: error.name,
         stack: error.stack,
         body: req.body,
       });
       console.error(error);
       return res.status(500).json({
         success: false,
         message: "Internal Server Error",
       });
  }
};












// import db from "../models/index.js";

// // Assign Permission to Role controller(super admin only)
// export const assignPermissionToRole = async (req, res) => {
//   const t = await db.sequelize.transaction();
//   try {
//     const { roleId, permissionId } = req.body;

//     const role = await db.Role.findByPk(roleId, { transaction: t });
//     const permission = await db.Permission.findByPk(permissionId, {
//       transaction: t,
//     });

//     if (!role || !permission) {
//       await t.rollback();
//       return res.status(404).json({ success: false, message: "Role or Permission not found" });
//     }

//     const alreadyHasPermission = await role.hasPermission(permission, {
//       transaction: t,
//     });
//     if (alreadyHasPermission) {
//       await t.rollback();
//       return res
//         .status(400)
//         .json({ success: false, message: "Role already has this permission" });
//     }

//     await role.addPermission(permission, { transaction: t }); // Sequelize magic method
//     await t.commit();

//     res.json({
//       message: `Permission ${permission.name} assigned to role ${role.code}`,
//     });
//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

