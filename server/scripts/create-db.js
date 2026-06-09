import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const dbPath = resolve("data/last-race.sqlite");
const schemaPath = resolve("db/schema.sql");
const seedPaths = [
  resolve("db/lines_stations_insert.sql"),
  resolve("db/connections_insert.sql"),
  resolve("db/users_insert.sql"),
  resolve("db/events_insert.sql"),
  resolve("db/games_insert.sql"),
];

mkdirSync(dirname(dbPath), { recursive: true });

const schema = readFileSync(schemaPath, "utf8");
const db = new DatabaseSync(dbPath);

function ensureEventWeightColumn(database) {
  const columns = database.prepare("PRAGMA table_info(events)").all();
  const hasWeightColumn = columns.some((column) => column.name === "weight");

  if (!hasWeightColumn) {
    database.exec(`
      ALTER TABLE events
      ADD COLUMN weight INTEGER NOT NULL DEFAULT 1
    `);
  }
}

try {
  db.exec(schema);
  ensureEventWeightColumn(db);

  for (const seedPath of seedPaths) {
    const seedSql = readFileSync(seedPath, "utf8");
    db.exec(seedSql);
  }

  console.log(`Created and seeded database at ${dbPath}`);
} finally {
  db.close();
}
