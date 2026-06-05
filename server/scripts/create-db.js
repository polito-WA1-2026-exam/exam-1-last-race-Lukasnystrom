import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = resolve("data/last-race.sqlite");
const schemaPath = resolve("db/schema.sql");

mkdirSync(dirname(dbPath), { recursive: true });

const schema = readFileSync(schemaPath, "utf8");
const db = new DatabaseSync(dbPath);

try {
  db.exec(schema);
  console.log(`Created database schema at ${dbPath}`);
} finally {
  db.close();
}
