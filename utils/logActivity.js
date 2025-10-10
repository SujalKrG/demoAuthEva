import db from "../models/index.js";

const logActivity = async ({
  created_by,
  user_id = null,
  action,
  module,
  details = {},
}) => {
  try {
    await db.AdminActivityLog.create({
      created_by,
      user_id,
      action,
      module,
      details,
    });
    console.log(`Logged: ${action} on ${module} by ${created_by}`);
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};

export default logActivity;
