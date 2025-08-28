const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Role, Permission } = require("../models");
require("dotenv").config({ path: "../.env" });

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
};

//LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
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

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT is not configured" });
    }
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Tokens
    const accessToken = generateAccessToken(admin);
    try {
      admin.remember_token = accessToken;
      await admin.save();
    } catch (error) {
      return res
        .status(500)
        .json({ message: "failed to update the token", error: error.message });
    }

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
    const headerToken = req.headers.authorization?.split(" ")[1];
    if (!headerToken) {
      return res.status(200).json({ message: "Logout successful" });
      // 👍 Don't expose info, client should just clear local token
    }

    let decoded;
    try {
      decoded = jwt.verify(headerToken, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        decoded = jwt.decode(headerToken); // fallback to extract id
      } else {
        return res.status(200).json({ message: "Logout successful" });
        // 👍 Treat as logged out
      }
    }

    if (decoded?.id) {
      const admin = await Admin.findByPk(decoded.id);
      if (admin && admin.remember_token === headerToken) {
        admin.remember_token = null;
        await admin.save();
      }
    }

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Logout failed" });
  }
};
