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

const migrationsDir = path.join(process.cwd(), "database", "migrations");

if (!existsSync(migrationsDir)) {
  console.error(`Folder migration tidak ditemukan: ${migrationsDir}`);
  process.exit(1);
}

const connection = await mysql.createConnection({ uri: databaseUrl, multipleStatements: true });

try {
  await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);

  const [rows] = await connection.query("SELECT filename FROM schema_migrations");
  const executed = new Set(rows.map((row) => row.filename));
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  for (const file of files) {
    if (executed.has(file)) {
      console.log(`skip ${file}`);
      continue;
    }

    const sql = readFileSync(path.join(migrationsDir, file), "utf8").trim();

    if (!sql) {
      console.log(`skip empty ${file}`);
      continue;
    }

    console.log(`run ${file}`);
    await connection.query(sql);
    await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [file]);
  }

  console.log("Migration selesai.");
} finally {
  await connection.end();
}
