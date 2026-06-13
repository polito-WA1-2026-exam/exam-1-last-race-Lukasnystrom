import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const currentDir = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(currentDir, "../data/last-race.sqlite");

const db = new DatabaseSync(dbPath);

db.exec("PRAGMA foreign_keys = ON;");

export default db;
