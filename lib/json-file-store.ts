import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dataDirectory = path.join(process.cwd(), "data");

export function loadJsonFile<T>(fileName: string, fallback: T): T {
  const filePath = getJsonFilePath(fileName);

  if (!existsSync(filePath)) {
    saveJsonFile(fileName, fallback);
    return cloneJson(fallback);
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return cloneJson(fallback);
  }
}

export function saveJsonFile<T>(fileName: string, data: T) {
  mkdirSync(dataDirectory, { recursive: true });
  writeFileSync(getJsonFilePath(fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function resetJsonFile<T>(fileName: string, fallback: T): T {
  saveJsonFile(fileName, fallback);
  return cloneJson(fallback);
}

function getJsonFilePath(fileName: string) {
  if (!/^[a-z0-9-]+\.json$/.test(fileName)) {
    throw new Error(`Nama file data tidak valid: ${fileName}`);
  }

  return path.join(dataDirectory, fileName);
}

function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
