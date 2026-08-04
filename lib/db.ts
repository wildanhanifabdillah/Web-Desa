import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

export type SqlValue = string | number | boolean | Date | Buffer | null;

let pool: Pool | null = null;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL belum diatur. Isi .env.local untuk lokal atau environment VPS.");
  }

  return databaseUrl;
}

export function getDbPool() {
  if (!pool) {
    pool = mysql.createPool({
      uri: getDatabaseUrl(),
      waitForConnections: true,
      connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT ?? 4),
      queueLimit: 0,
    });
  }

  return pool;
}

export async function queryRows<T extends RowDataPacket>(sql: string, values: SqlValue[] = []) {
  const [rows] = await getDbPool().query<T[]>(sql, values);

  return rows;
}

export async function executeSql(sql: string, values: SqlValue[] = []) {
  const [result] = await getDbPool().execute<ResultSetHeader>(sql, values);

  return result;
}

export async function withDbConnection<T>(callback: (connection: PoolConnection) => Promise<T>) {
  const connection = await getDbPool().getConnection();

  try {
    return await callback(connection);
  } finally {
    connection.release();
  }
}

export async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
