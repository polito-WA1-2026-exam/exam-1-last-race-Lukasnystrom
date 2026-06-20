import db from "../db/database.js";

const insertCompletedGameStatement = db.prepare(`
  INSERT INTO games (
    user_id,
    start_station_id,
    destination_station_id,
    route_valid,
    final_score,
    started_at,
    completed_at
  )
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const getRankingStatement = db.prepare(`
  SELECT
    users.id,
    users.username,
    users.display_name AS displayName,
    MAX(games.final_score) AS bestScore,
    COUNT(games.id) AS gamesPlayed
  FROM games
  JOIN users ON users.id = games.user_id
  GROUP BY users.id, users.username, users.display_name
  ORDER BY bestScore DESC, gamesPlayed DESC, displayName COLLATE NOCASE ASC
`);

function toSqliteTimestamp(value) {
  return new Date(value).toISOString().slice(0, 19).replace("T", " ");
}

export function insertCompletedGame({
  userId,
  startStationId,
  destinationStationId,
  routeValid,
  finalScore,
  startedAt,
  completedAt = new Date(),
}) {
  const result = insertCompletedGameStatement.run(
    userId,
    startStationId,
    destinationStationId,
    routeValid ? 1 : 0,
    finalScore,
    toSqliteTimestamp(startedAt),
    toSqliteTimestamp(completedAt),
  );

  return Number(result.lastInsertRowid);
}

export function getRanking() {
  return getRankingStatement.all();
}
