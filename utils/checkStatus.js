import db from"../models/index.js";

// Fetch access token by admin ID
const getAccessTokenByAdminId = async (adminId) => {
  try {
    const admin = await db.Admin.findByPk(adminId, {
      attributes: ["id", "remember_token"], // only fetch what you need
    });

    if (!admin || !admin.remember_token) {
      return null; // no token found
    }

    return admin.remember_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

// Fetch access token directly by token value
const getAdminByAccessToken = async (token) => {
  try {
    const admin = await db.Admin.findOne({
      where: { remember_token: token },
      attributes: ["id", "email", "remember_token"],
    });

    return admin;
  } catch (error) {
    console.error("Error fetching admin by token:", error);
    throw error;
  }
};

export {
  getAccessTokenByAdminId,
  getAdminByAccessToken,
};
