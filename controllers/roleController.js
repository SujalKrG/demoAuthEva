import {
  createRoleService,
  getAllRolesService,
} from "../services/roleService.js";

export const createRole = async (req, res) => {
  try {
    const role = await createRoleService(req.body);
    res.status(201).json({
      success: true,
      message: "Role created successfully with permissions",
      role,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllRoles= async (req, res) => {
  try {
    const roles = await getAllRolesService();
    res.status(200).json({ success: true, roles });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};









// import db, { sequelize } from "../models/index.js";
// import { cleanString } from "../utils/occasionResource.js";

// // Create Role with Permissions
// export const createRole = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { name, code, permissions } = req.body;

//     if (!name || !code) {
//       await t.rollback();
//       return res
//         .status(400)
//         .json({ success: false, message: "Name and Code are required" });
//     }

//     // Check duplicate role code
//     const existing = await db.Role.findOne({ where: { code }, transaction: t });
//     if (existing) {
//       await t.rollback();
//       return res
//         .status(400)
//         .json({ success: false, message: "Role code already exists" });
//     }

//     // Create role
//     const role = await db.Role.create(
//       { name, code: code.trim().toUpperCase() },
//       { transaction: t }
//     );

//     // Handle permissions if provided
//     if (Array.isArray(permissions) && permissions.length > 0) {
//       const uniquePerms = [
//         ...new Set(permissions.map((p) => p.trim().toLowerCase())),
//       ];

//       // Find permissions in DB
//       const foundPerms = await db.Permission.findAll({
//         where: { name: uniquePerms },
//         transaction: t,
//       });

//       if (foundPerms.length === 0) {
//         await t.rollback();
//         return res.status(400).json({
//           success: false,
//           message: "No valid permissions found to assign",
//         });
//       }

//       // Assign (Sequelize avoids duplicates in join table)
//       await role.addPermissions(foundPerms, { transaction: t });
//     }

//     await t.commit();

//     const roleWithPermissions = await db.Role.findByPk(role.id, {
//       include: [{ model: db.Permission, as: "permissions" }],
//     });

//     res.status(201).json({
//       success: true,
//       message: "Role created successfully with permissions",
//       role: roleWithPermissions,
//     });
//   } catch (error) {
//     await t.rollback();
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };

// export const getAllRoles = async (req, res) => {
//   try {
//     const roles = await db.Role.findAll({attributes:['id','name','code']});
//     res.status(200).json({ success: true, roles });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };
