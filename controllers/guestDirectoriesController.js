import db from "../models/index.js";
import handleSequelizeError from "../utils/handelSequelizeError.js";
import { Sequelize, remoteSequelize } from "../models/index.js";
import UserModelFactory from "../models/remote/user.js";

const UserModel = UserModelFactory(remoteSequelize, Sequelize.DataTypes);

export const getAllGuestDirectories = async (req, res) => {
  try {
    // 1) fetch guest directories
    const guestDirectories = await db.GuestDirectories.findAll({
      attributes: ["id", "user_id", "name","country_code","phone", "created_at", "updated_at"], // pick needed fields
      order: [["created_at", "DESC"]],
    });

    if (!guestDirectories.length) {
      return res.json([]);
    }

    // 2) extract user_ids
    const userIds = guestDirectories.map((g) => g.user_id).filter(Boolean);

    // 3) fetch users from remote DB
    const users = await UserModel.findAll({
      where: { id: userIds },
      attributes: ["id", "name", "mobile", "email"], // select only needed fields
      raw: true,
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    // 4) attach user info to each directory
    const result = guestDirectories.map((dir) => {
      const d = dir.toJSON();
      return {
        ...d,
        user: userMap.get(d.user_id) || null, // attach user or null if not found
      };
    });

    return res.json(result);
  } catch (error) {
    const handled = handleSequelizeError(error, res);
    if (handled) return handled;

    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "production"
          ? "Internal Server Error"
          : error.message,
    });
  }
};
