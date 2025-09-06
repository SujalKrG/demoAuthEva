import bcrypt from "bcryptjs";
import db from "../../models/index.js";
import { logActivity } from "../../utils/logActivity.js";



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
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const emailExists = await db.Admin.findOne({ where: { email } });
    if (emailExists) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
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
      .json({
        success: true,
        message: "Admin created successfully",
        admin: adminData,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    const admins = await db.Admin.findAll();
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
