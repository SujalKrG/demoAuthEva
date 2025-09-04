import db from "../../models/index.js";


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
