const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Role, Permission } = require("../models");

//Register
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //Check if the email exists
    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //create user
    const admin = await Admin.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Admin registered successfully",
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // sign token
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: rememberMe ? "7d" : "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
};
