import db from "../models/index.js";
//this controller fetch all admin activity
export const getAdminActivityLogs = async (req, res) => {
  try {
    const logs = await db.AdminActivityLog.findAll();
    const adminName = await db.Admin.findByPk(3);
    if (!adminName) {
      throw new Error("Admin not found");
    }
    res.status(200).json({
      logs,
    });
  } catch (error) {
    console.error("Error fetching admin activity logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const showDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await db.AdminActivityLog.findOne({
      attributes: ["created_by", "action", "created_at", "updated_at"],
      where: { id },
    });
    const admin = await db.Admin.findOne({
      attributes: ["id", "name","emp_id"],
      where: { id: log.created_by },
    });

    if (!admin) {
      throw new Error("Admin not found");
    }

    if (!log) {
      throw new Error("Log not found");
    }
    res.status(200).json({
      created_by: {
        id: admin.id,
        name: `${admin.name} (${admin.emp_id})`,
      },
      action: log.action,
      created_at: log.created_at,
      updated_at: log.updated_at,
    });
  } catch (error) {
    console.error("Error fetching admin activity log details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
