import db from "../db/database.js";

const getEventsStatement = db.prepare(`
  SELECT
    id,
    description,
    coin_effect AS coinEffect,
    weight
  FROM events
  ORDER BY id
`);

export function getEvents() {
  return getEventsStatement.all();
}
