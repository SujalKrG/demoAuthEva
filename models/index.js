import fs from "fs";
import path from "path";
import Sequelize from "sequelize";
import { fileURLToPath, pathToFileURL } from "url";
import configFile from "../config/config.js";
import registerActivityHooks from "../utils/registerAcitivityHooks.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";

const db = {};

// Remote DB #1 (use "development" block from config)
const config1 = configFile[env];  // 👈 now this matches your config
const sequelize = new Sequelize(
  config1.database,
  config1.username,
  config1.password,
  config1
);

// Remote DB #2 (use "remote" block from config)
const config2 = configFile.remote;
const remoteSequelize = new Sequelize(
  config2.database,
  config2.username,
  config2.password,
  config2
);

// Load models dynamically into Remote DB #1
for (const file of fs.readdirSync(__dirname).filter(
  (file) =>
    file.indexOf(".") !== 0 &&
    file !== basename &&
    file.slice(-3) === ".js" &&
    !file.includes(".test.js")
)) {
  const modelPath = path.join(__dirname, file);
  const modelModule = await import(pathToFileURL(modelPath).href);
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

db.sequelize = sequelize;         // Remote DB #1
db.remoteSequelize = remoteSequelize; // Remote DB #2
db.Sequelize = Sequelize;

registerActivityHooks(db);

export default db;
export { sequelize, Sequelize, remoteSequelize };
