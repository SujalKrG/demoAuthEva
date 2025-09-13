// scripts/runUndoMigrations.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Sequelize } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT ?? "mysql",
    logging: false,
  }
);

async function run() {
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
  // reverse order
  files.sort().reverse();

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    console.log("Reverting migration:", file);
    try {
      const mod = await import(fullPath);
      const migration = mod.default ?? mod;
      if (typeof migration.down !== "function") {
        console.warn(`Skipping ${file} — no down() exported.`);
        continue;
      }
      // call down with the same signature you used for up
      await migration.down(sequelize.getQueryInterface(), Sequelize);
      console.log("Reverted:", file);
    } catch (err) {
      console.error(`Failed to revert ${file}:`, err);
      // decide: continue to next or abort. continuing so you can revert as much as possible:
      // if you want to abort on first error, replace continue with: throw err;
      continue;
    }
  }

  await sequelize.close();
  console.log("All possible down migrations executed");
}

run().catch((err) => {
  console.error("Undo migrations failed:", err);
  process.exit(1);
});
