// utils/activityLogger.js
import db from "../models/index.js";

export const logActivity = async (
  adminId,
  description,
  module,
  previousData,
  newData
) => {
  try {
    // 🟢 Clean previous data: remove timestamps
    const { created_at, updated_at, deleted_at, ...cleanPrevData } =
      previousData?.toJSON ? previousData.toJSON() : previousData;

    // 🟢 Fields to ignore from tracking
    const ignoreFields = ["created_at", "updated_at", "deleted_at"];

    // 🟢 Compute changes: only different values
    const changes = {};
    for (const key in newData) {
      if (ignoreFields.includes(key)) continue; // skip timestamps

      // Compare deeply for arrays & objects
      const before = cleanPrevData[key];
      const after = newData[key];

      const isDifferent =
        Array.isArray(before) && Array.isArray(after)
          ? JSON.stringify(before) !== JSON.stringify(after)
          : before !== after;

      if (isDifferent) {
        changes[key] = after;
      }
    }
await db.AdminActivityLog.create({
      created_by: adminId,
      description,
      module,
      previous_data: cleanPrevData, // full old record
      new_data: changes, // only changed fields
    });
    
  } catch (error) {
    console.error("Error logging admin activity:", error);
  }
};
