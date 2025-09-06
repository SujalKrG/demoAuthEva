// hooks/activityLogger.js
import { logActivity } from "../utils/logActivity.js";

export const registerActivityHooks = (db) => {
  Object.values(db).forEach((model) => {
    if (
      model.name &&
      !["AdminActivityLog", "Sequelize", "sequelize"].includes(model.name)
    ) {
      // After Update
      model.addHook("afterUpdate", async (instance, options) => {
        if (!options.userId) return;
        await logActivity(
          options.userId,
          `Updated ${model.name} record (ID: ${instance.id})`,
          model.name,
          instance._previousDataValues,
          instance.dataValues
        );
      });

      // After Create
      model.addHook("afterCreate", async (instance, options) => {
        if (!options.userId) return;
        await logActivity(
          options.userId,
          `Created ${model.name} record (ID: ${instance.id})`,
          model.name,
          {},
          instance.dataValues
        );
      });

      // After Delete
      model.addHook("afterDestroy", async (instance, options) => {
        if (!options.userId) return;
        await logActivity(
          options.userId,
          `Deleted ${model.name} record (ID: ${instance.id})`,
          model.name,
          instance.dataValues,
          {}
        );
      });
    }
  });
};
