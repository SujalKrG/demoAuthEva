const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Admin, Role, Permission } = require("../models");
require("dotenv").config({ path: "../.env" });

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: "1m",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
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

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // Tokens
    const accessToken = generateAccessToken(admin);
    const refreshToken = rememberMe ? generateRefreshToken(admin) : null;

    // Set Access Token Cookie (15 min)
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // ⚠️ set to false for local dev without HTTPS
      sameSite: "strict",
      maxAge: 60 * 1000,
    });

    // Set Refresh Token Cookie (7 days) only if rememberMe
    if (rememberMe) {
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    res.json({ message: "Login successful", accessToken, refreshToken });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again later." });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(403).json({ message: "Refresh token required" });
    }
    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const newAccessToken = generateAccessToken({
        id: decoded.id,
        email: decoded.email,
      });

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 1000,
      });

      return res.json({ message: "Access token refreshed" });
    });
  } catch (error) {}
};

exports.logout = (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Logout successful" });
};
