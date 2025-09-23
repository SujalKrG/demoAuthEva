import {
  createPermissionsService,
  getAllPermissionsService,
} from "../services/permissionService.js";

export const createPermission = async (req, res) => {
  try {
    const result = await createPermissionsService(req.body.names);

    res.status(201).json({
      success: true,
      message: result.message,
      added: result.added,
      skipped: result.skipped,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

export const getAllPermissions = async (req, res) => {
  try {
    const result = await getAllPermissionsService();
    return res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};














// import db from "../models/index.js";

// // Create Multiple Permissions (super admin only)
// export const createPermission = async (req, res) => {
//   try {
//     let names = req.body.names;

//     if (!Array.isArray(names) || names.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Permissions array is required",
//       });
//     }

//     // Normalize: lowercase + trim + remove duplicates
//     names = [...new Set(names.map((n) => n.trim().toLowerCase()))];

//     // Find existing permissions in DB
//     const existingPermissions = await db.Permission.findAll({
//       where: { name: names },
//     });
//     const existingNames = existingPermissions.map((p) => p.name);

//     // Filter out already existing
//     const newNames = names.filter((n) => !existingNames.includes(n));

//     if (newNames.length === 0) {
//       return res.status(200).json({
//         success: true,
//         message: "All provided permissions already exist",
//         added: [],
//         skipped: names,
//       });
//     }

//     // Bulk insert new permissions
//     const newPermissions = await db.Permission.bulkCreate(
//       newNames.map((n) => ({ name: n }))
//     );

//     res.status(201).json({
//       success: true,
//       message: "Permissions processed successfully",
//       added: newPermissions,
//       skipped: existingNames,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };
