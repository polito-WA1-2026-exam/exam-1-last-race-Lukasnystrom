PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  x_coord REAL NOT NULL,
  y_coord REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS line_stations (
  line_id INTEGER NOT NULL,
  station_id INTEGER NOT NULL,
  station_order INTEGER NOT NULL,
  PRIMARY KEY (line_id, station_id),
  UNIQUE (line_id, station_order),
  FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS segments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  line_id INTEGER NOT NULL,
  station_a INTEGER NOT NULL,
  station_b INTEGER NOT NULL,
  segment_order INTEGER NOT NULL,
  CHECK (station_a <> station_b),
  UNIQUE (line_id, station_a, station_b),
  UNIQUE (line_id, segment_order),
  FOREIGN KEY (line_id) REFERENCES lines(id) ON DELETE CASCADE,
  FOREIGN KEY (station_a) REFERENCES stations(id) ON DELETE CASCADE,
  FOREIGN KEY (station_b) REFERENCES stations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL UNIQUE,
  coin_effect INTEGER NOT NULL,
  CHECK (coin_effect BETWEEN -4 AND 4)
);

CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  start_station_id INTEGER NOT NULL,
  destination_station_id INTEGER NOT NULL,
  route_valid INTEGER NOT NULL CHECK (route_valid IN (0, 1)),
  final_score INTEGER NOT NULL CHECK (final_score >= 0),
  started_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (start_station_id) REFERENCES stations(id),
  FOREIGN KEY (destination_station_id) REFERENCES stations(id)
);
