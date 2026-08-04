import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";
import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL belum diatur.");
  process.exit(1);
}

const seedersDir = path.join(process.cwd(), "database", "seeders");

if (!existsSync(seedersDir)) {
  console.error(`Folder seeder tidak ditemukan: ${seedersDir}`);
  process.exit(1);
}

const connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });

try {
  const files = readdirSync(seedersDir)
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  for (const file of files) {
    const sql = readFileSync(path.join(seedersDir, file), "utf8").trim();

    if (!sql) {
      console.log(`skip empty ${file}`);
      continue;
    }

    console.log(`seed ${file}`);
    await connection.query(sql);
  }

  console.log("Seeder selesai.");
} finally {
  await connection.end();
}
