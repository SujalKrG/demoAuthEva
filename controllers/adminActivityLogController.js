import db from "../models/index.js";
const { AdminActivityLog, Admin } = db;
import { formatToIST } from "../utils/requiredMethods.js";

import { Op } from "sequelize";

export const getAdminActivityLogs = async (req, res) => {
  try {
    const { date, search } = req.query;

    const where = {};

    // 📅 Single date filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.created_at = {
        [Op.between]: [startOfDay, endOfDay],
      };
    }

    // 🔍 q filter
    if (search) {
      where[Op.or] = [
        { action: { [Op.like]: `%${search}%` } },
        { module: { [Op.like]: `%${search}%` } },
        { "$admin.name$": { [Op.like]: `%${search}%` } },
        { "$admin.emp_id$": { [Op.like]: `%${search}%` } },
      ];
    }

    const logs = await db.AdminActivityLog.findAll({
      where,
      include: [
        {
          model: db.Admin,
          as: "admin",
          attributes: ["id", "name", "emp_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const formattedLogs = logs.map((log) => ({
      id: log.id,
      created_by: log.admin
        ? {
            id: log.admin.id,
            name: `${log.admin.name} (${log.admin.emp_id})`,
          }
        : null,
      action: log.action,
      module: log.module,
      details: log.details,
      created_at: new Date(log.created_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
      updated_at: new Date(log.updated_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
    }));

    res.status(200).json({
      success: true,
      message: "Fetched successfully",
      logs: formattedLogs,
    });
  } catch (error) {
    console.error("Error fetching admin activity logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const showDetailsById = async (req, res) => {
  try {
    const { id } = req.params; // can be single or comma separated
    const { limit, all } = req.query;

    const ids = id.split(",").map((i) => Number(i));

    const queryOptions = {
      where: {
        module: "theme",
      },
      include: [
        {
          model: Admin,
          as: "admin",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["updated_at", "DESC"]],
    };

    // MySQL/SQLite JSON query
    queryOptions.where["details.id"] = ids.length === 1 ? ids[0] : ids;

    if (!all) {
      queryOptions.limit = limit ? parseInt(limit, 10) : 1; // default last one
    }

    const activities = await AdminActivityLog.findAll(queryOptions);

    if (!activities || activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No activity found`,
      });
    }

    // If only one id and limit=1, return single object
    if (ids.length === 1 && !all && queryOptions.limit === 1) {
      return res.json({
        success: true,
        data: {
          id: activities[0].id,
          created_by: activities[0].admin
            ? {
                id: activities[0].admin.id,
                name: activities[0].admin.name,
                email: activities[0].admin.email,
              }
            : null,
          action: activities[0].action,
          module: activities[0].module,
          details: activities[0].details,
          created_at: formatToIST(activities[0].created_at),
          updated_at: formatToIST(activities[0].updated_at),
        },
      });
    }
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      created_by: activity.admin
        ? {
            id: activity.admin.id,
            name: activity.admin.name,
            email: activity.admin.email,
          }
        : null,
      action: activity.action,
      module: activity.module,
      details: activity.details,
      created_at: formatToIST(activity.created_at),
      updated_at: formatToIST(activity.updated_at),
    }));

    res.json({ success: true, data: formattedActivities });
  } catch (error) {
    console.error("Error fetching theme activity:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
