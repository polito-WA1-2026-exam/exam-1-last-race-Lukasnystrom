import db from "../db/database.js";

const getUserByIdStatement = db.prepare(`
  SELECT id, username, display_name, password_hash, salt
  FROM users
  WHERE id = ?
`);

const getUserByUsernameStatement = db.prepare(`
  SELECT id, username, display_name, password_hash, salt
  FROM users
  WHERE username = ?
`);

export function getUserById(userId) {
  return getUserByIdStatement.get(userId) ?? null;
}

export function getUserByUsername(username) {
  return getUserByUsernameStatement.get(username) ?? null;
}
