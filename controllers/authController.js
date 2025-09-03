import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";
import dotenv from "dotenv";

dotenv.config();

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// LOGIN controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const admin = await db.Admin.findOne({
      where: { email },
      include: [
        {
          model: db.Role,
          as: "roles",
          include: [
            {
              model: db.Permission,
              as: "permissions",
              attributes: ["id"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!admin)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });
    if (!admin.status) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Account is inactive, contact super admin",
        });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid email or password" });

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ success: false, message: "JWT_SECRET not configured" });
    }

    const accessToken = generateAccessToken(admin);
    admin.remember_token = accessToken;
    await admin.save();

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        roles: admin.roles,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
  }
};

// LOGOUT controller
export const logout = async (req, res) => {
  try {
    const headerToken = req.headers.authorization?.split(" ")[1];

    //if no token provided
    if (!headerToken) {
      return res
        .status(200)
        .json({ success: true, message: "Logout successful(no token)" });
    }

    let decoded;
    try {
      decoded = jwt.verify(headerToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        decoded = jwt.decode(headerToken);
      } else {
        return res
          .status(200)
          .json({
            success: true,
            message: "Logout successful (invalid token)",
          });
      }
    }
    //decoded token doesn't have id
    if (!decoded?.id) {
      return res
        .status(200)
        .json({ success: true, message: "Logout successful (no user id)" });
    }

    // user lookup
    const admin = await db.Admin.findByPk(decoded.id);
    if (!admin) {
      return res
        .status(200)
        .json({ success: true, message: "Logout successful (user not found)" });
    }

    if (decoded?.id) {
      if (admin && admin.remember_token === headerToken) {
        admin.remember_token = null;
        await admin.save();
      }
    }

    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
};
