import {
  addAdminService,
  getAllAdminsService,
  getAdminByIdService,
  getAdminWithRoleAndPermissionsService,
} from "../services/adminService.js";

export const addAdmin = async (req, res) => {
  try {
    const admin = await addAdminService(req.body);
    res
      .status(201)
      .json({ success: true, message: "Admin created successfully", admin });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await getAllAdminsService();
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminById = async (req, res) => {
  try {
    const admin = await getAdminByIdService(req.params.id);
    res.status(200).json({ success: true, admin });
  } catch (error) {
    res
      .status(error.message === "Admin not found" ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};

export const getAdminWithRoleAndPermissionsById = async (req, res) => {
  try {
    const data = await getAdminWithRoleAndPermissionsService();
    res
      .status(200)
      .json({ success: true, message: "Fetched successfully", data });
  } catch (error) {
    res
      .status(error.message === "Admin not found" ? 404 : 500)
      .json({ success: false, message: error.message });
  }
};

export const updateAdmin = async (req, res) => {};












// import bcrypt from "bcryptjs";
// import db from "../models/index.js";
// import {sequelize} from "../models/index.js";

// export const addAdmin = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const { password, roles } = req.body;

//     const name = req.body.name?.trim();
//     const email = req.body.email?.trim().toLowerCase();
//     const phone = req.body.phone?.trim();
//     const address = req.body.address?.trim();
//     const city = req.body.city?.trim();
//     const emp_id = req.body.emp_id?.trim();
//     const status = req.body.status;

//     if (!name || !email || !phone || !address || !city || !emp_id) {
//       await t.rollback();
//       return res
//         .status(400)
//         .json({ success: false, message: "All fields are required" });
//     }

//     const emailExists = await db.Admin.findOne({ where: { email }, transaction: t });
//     if (emailExists) {
//       await t.rollback();
//       return res
//         .status(400)
//         .json({ success: false, message: "Email already exists" });
//     }

//     if (!password) {
//       await t.rollback();
//       return res
//         .status(400)
//         .json({ success: false, message: "Password is required" });
//     }

//     if (password.length < 6) {
//       await t.rollback();
//       return res.status(400).json({
//         success: false,
//         message: "Password must be at least 6 characters long",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create admin
//     const newAdmin = await db.Admin.create(
//       {
//         name,
//         email,
//         phone,
//         password: hashedPassword,
//         emp_id,
//         address,
//         city,
//         status: status ?? true,
//       },
//       { transaction: t }
//     );

//     // Assign roles if provided
//     if (Array.isArray(roles) && roles.length > 0) {
//       const uniqueRoles = [...new Set(roles.map((r) => r.trim().toUpperCase()))];

//       const foundRoles = await db.Role.findAll({
//         where: { code: uniqueRoles },
//         transaction: t,
//       });

//       if (foundRoles.length > 0) {
//         await newAdmin.addRoles(foundRoles, { transaction: t });
//       }
//     }

//     await t.commit();

//     const adminWithRoles = await db.Admin.findByPk(newAdmin.id, {
//       attributes: { exclude: ["password"] },
//       include: [{ model: db.Role, as: "roles", attributes: ["id", "name", "code"] }],
//     });

//     res.status(201).json({
//       success: true,
//       message: "Admin created successfully with roles",
//       admin: adminWithRoles,
//     });
//   } catch (error) {
//     await t.rollback();
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };
// export const getAllAdmins = async (req, res) => {
//   try {
//     const admins = await db.Admin.findAll();
//     res.status(200).json({ success: true, admins });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, message: "Server error", error: error.message });
//   }
// };

// export const getAdminById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const admin = await db.Admin.findByPk(id);
//     if (!admin) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Admin not found" });
//     }
//     res.status(200).json({ success: true, admin });
//   } catch (error) {
//     res
//       .status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };

// // controllers/adminController.js
// export const getAdminWithRoleAndPermissionsById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const admin = await db.Admin.findByPk(id, {
//       attributes: ["id", "name", "email"], // exclude password
//       include: [
//         {
//           model: db.Role,
//           as: "roles", // ✅ alias must match in associations
//           attributes: ["id", "name", "code"],
//           through: { attributes: [] }, // remove pivot data
//           include: [
//             {
//               model: db.Permission,
//               as: "permissions",
//               attributes: ["id", "name"],
//               through: { attributes: [] },
//             },
//           ],
//         },
//       ],
//     });

//     if (!admin) {
//       return res.status(404).json({
//         success: false,
//         message: "Admin not found",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Fetched admin role & permissions successfully",
//       data: {
//         id: admin.id,
//         name: admin.name,
//         email: admin.email,
//         roles: admin.roles.map((role) => ({
//           id: role.id,
//           name: role.name,
//           code: role.code,
//           permissions: role.permissions.map((p) => p.name),
//         })),
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching admin role & permissions:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };
