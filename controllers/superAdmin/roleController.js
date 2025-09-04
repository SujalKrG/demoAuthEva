import db from "../../models/index.js";

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
