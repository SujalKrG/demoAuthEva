
import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import process from "process";
import { fileURLToPath, pathToFileURL } from "url";
import configFile from "../config/config.js";
import { registerActivityHooks } from "../hooks/activityLogger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configFile[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Remote DB
const remoteConfig = configFile.remote;
const remoteSequelize = new Sequelize(
  remoteConfig.database,
  remoteConfig.username,
  remoteConfig.password,
  remoteConfig
);

// Load models dynamically
for (const file of fs.readdirSync(__dirname).filter(
  (file) =>
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.slice(-3) === ".js" &&
    !file.includes(".test.js")
)) {
  const modelPath = path.join(__dirname, file);
  const modelModule = await import(pathToFileURL(modelPath).href); // ✅ FIX
  const modelFactory = modelModule.default || modelModule;
  const model = modelFactory(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

// Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.remoteSequelize = remoteSequelize;
db.Sequelize = Sequelize;
registerActivityHooks(db);
export default db;
export { sequelize, Sequelize, remoteSequelize };
