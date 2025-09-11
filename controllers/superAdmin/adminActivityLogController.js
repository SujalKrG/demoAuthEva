import db from "../../models/index.js";
const { AdminActivityLog } = db;
//this controller fetch all admin activity 
export const getAdminActivityLogs = async (req, res) => {
  try {
    const logs = await AdminActivityLog.findAll();
    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching admin activity logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
