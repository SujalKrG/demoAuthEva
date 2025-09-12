// scripts/runMigrations.mjs
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
    dialect: process.env.DB_DIALECT ?? "mysql", // or 'postgres'
    logging: false,
  }
);

async function run() {
  const migrationsDir = path.join(__dirname, "..", "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
  files.sort();

  for (const file of files) {
    const fullPath = path.join(migrationsDir, file);
    console.log("Applying migration:", file);
    const mod = await import(fullPath);
    const migration = mod.default ?? mod;
    if (typeof migration.up !== "function") {
      console.warn(`Skipping ${file} — no up() exported.`);
      continue;
    }
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    console.log("Applied:", file);
  }

  await sequelize.close();
  console.log("Migrations done");
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
