// scripts/runSeeders.mjs
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
  const seedersDir = path.join(__dirname, "..", "seeders");
  const files = fs
    .readdirSync(seedersDir)
    .filter((f) => f.endsWith(".js") || f.endsWith(".mjs"));
  files.sort();

  for (const file of files) {
    const fullPath = path.join(seedersDir, file);
    console.log("Running seeder:", file);
    const mod = await import(fullPath);
    const seeder = mod.default ?? mod;
    if (typeof seeder.up !== "function") {
      console.warn(`Skipping ${file} — no up() exported.`);
      continue;
    }
    await seeder.up(sequelize.getQueryInterface(), Sequelize);
    console.log("Seeded:", file);
  }

  await sequelize.close();
  console.log("All seeders done");
}

run().catch((err) => {
  console.error("Seeder failed:", err);
  process.exit(1);
});
