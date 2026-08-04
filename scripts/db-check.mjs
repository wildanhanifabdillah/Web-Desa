import mysql from "mysql2/promise";
import { loadLocalEnv } from "./load-env.mjs";

loadLocalEnv();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL belum diatur.");
  process.exit(1);
}

const connection = await mysql.createConnection(databaseUrl);

try {
  const [rows] = await connection.query("SELECT DATABASE() AS database_name, VERSION() AS version");
  console.log(rows[0]);
} finally {
  await connection.end();
}
