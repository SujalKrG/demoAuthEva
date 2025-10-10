import handleSequelizeError from "../utils/handelSequelizeError.js";
import { sequelize, Sequelize, remoteSequelize } from "../models/index.js";
import UserModelFactory from "../models/remote/user.js";
import db from "../models/index.js";

const UserModel = UserModelFactory(remoteSequelize, Sequelize.DataTypes);

export const getAllGuestGroups = async (req, res) => {
  try {
    const { name, mobile } = req.query;
    const Op = Sequelize.Op;

    // 1) get distinct user_ids that exist in local GuestGroup
    const userIdRows = await db.GuestGroup.findAll({
      attributes: [
        [Sequelize.fn("DISTINCT", Sequelize.col("user_id")), "user_id"],
      ],
      raw: true,
    });

    const localUserIds = userIdRows.map((r) => r.user_id).filter(Boolean);
    if (!localUserIds.length) {
      // no users in GuestGroup
      return res.json([]);
    }

    // 2) build where for remote users (restrict to local IDs to keep it efficient)
    const userWhere = { id: localUserIds };
    if (name) userWhere.name = { [Op.like]: `%${name}%` }; // use iLike for Postgres if needed
    if (mobile) userWhere.mobile = { [Op.like]: `%${mobile}%` };

    // 3) find matching users in remote DB (those that match filters and exist in local groups)
    const matchedUsers = await UserModel.findAll({
      where: userWhere,
      attributes: ["id", "name", "mobile"],
      raw: true,
    });

    if (!matchedUsers.length) {
      // no users matched the filter -> nothing to return
      return res.json([]);
    }

    const matchedUserIds = matchedUsers.map((u) => u.id);
    const userMap = new Map(matchedUsers.map((u) => [u.id, u]));

    // 4) fetch GuestGroup for those matched user ids
    const guestGroups = await db.GuestGroup.findAll({
      where: { user_id: matchedUserIds },
      attributes: ["id", "user_id", "name", "created_at", "updated_at"],
      order: [["created_at", "DESC"]],
    });

    // 5) attach user info to each group
    const result = guestGroups
      .map((g) => {
        const grp = typeof g.toJSON === "function" ? g.toJSON() : g;
        return { ...grp, user: userMap.get(grp.user_id) || null };
      });

    return res.json(result);
  } catch (error) {
    // const handled = handleSequelizeError(error, res);
    // if (handled)return handled;

    return res.status(500).json({
      message: "Unexpected server error",
      error:
        process.env.NODE_ENV === "development"
          ? "Internal Server Error"
          : error.message,
    });
  }
};





// export const createGuestGroups = async (req, res) => {
//   try {
//     const { user_id, name } = req.body;
//     if (!name) {
//       return res.status(400).json({
//         success: false,
//         message: "Name is required",
//       });
//     }
//     const guestGroup = await db.GuestGroup.create({
//       user_id,
//       name,
//     });
//     res.status(201).json({
//       success: true,
//       message: "Guest group created successfully",
//       data: guestGroup,
//     });
//   } catch (error) {
//     const handled = handleSequelizeError(error, res);
//     if (handled) return handled;

//     return res.status(500).json({
//       message: "Unexpected server error",
//       error:
//         process.env.NODE_ENV === "production"
//           ? "Internal Server Error"
//           : error.message,
//     });
//   }
// };