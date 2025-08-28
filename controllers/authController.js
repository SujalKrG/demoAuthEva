const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Role, Permission } = require("../models");
require("dotenv").config({ path: "../.env" });

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

//LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    const admin = await Admin.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "roles",
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["id"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!admin)
      return res.status(400).json({ message: "Invalid email or password" });
    if (admin.status !== true) {
      return res
        .status(403)
        .json({ message: "Account is inactive contact super admin" });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Tokens
    const accessToken = generateAccessToken(admin);

    admin.remember_token = accessToken;
    await admin.save();

    res.json({
      message: "Login successful",
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        roles: admin.roles,
      },
    });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

exports.logout = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.admin.id);
    if (admin) {
      admin.remember_token = null; // clear token in DB
      await admin.save();
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Logout failed" });
  }
};
