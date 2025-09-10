// utils/registerActivityHooks.js
import logActivity from "./logActivity.js";

const registerActivityHooks = (db) => {
  Object.keys(db).forEach((modelName) => {
    const model = db[modelName];

    if (!model || typeof model.addHook !== "function") return;
    if (["AdminActivityLog", "sequelize", "Sequelize"].includes(modelName)) return;

    // After CREATE
    model.addHook("afterCreate", async (instance, options) => {
      const adminId = options?.user?.id || null;
      await logActivity({
        created_by: adminId,
        action: "CREATE",
        module: modelName,
        details: {
          after: instance.dataValues, // full snapshot for create
        },
        user_id: options?.userTargetId || null,
      });
    });

    // After UPDATE
    model.addHook("afterUpdate", async (instance, options) => {
      const adminId = options?.user?.id || null;

      const before = instance._previousDataValues;
      const after = {};
      for (const key in instance.dataValues) {
        if (
          instance.dataValues[key] !== before[key] // changed
        ) {
          after[key] = instance.dataValues[key]; // only changed fields
        }
      }

      await logActivity({
        created_by: adminId,
        action: "UPDATE",
        module: modelName,
        details: {
          before,
          after,
        },
        user_id: options?.userTargetId || null,
      });
    });

    // After DELETE
    model.addHook("afterDestroy", async (instance, options) => {
      const adminId = options?.user?.id || null;
      await logActivity({
        created_by: adminId,
        action: "DELETE",
        module: modelName,
        details: {
          before: instance.dataValues, // full row snapshot before delete
        },
        user_id: options?.userTargetId || null,
      });
    });
  });
};

export default registerActivityHooks;
