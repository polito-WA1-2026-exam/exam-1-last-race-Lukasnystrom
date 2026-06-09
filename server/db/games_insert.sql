PRAGMA foreign_keys = ON;

DELETE FROM games;

INSERT INTO games (
  user_id,
  start_station_id,
  destination_station_id,
  route_valid,
  final_score,
  started_at,
  completed_at
)
VALUES
  (
    (SELECT id FROM users WHERE username = 'mona.beck'),
    (SELECT id FROM stations WHERE name = 'Bro Hof'),
    (SELECT id FROM stations WHERE name = 'Sergels torg'),
    1,
    24,
    '2026-05-30 18:05:00',
    '2026-05-30 18:09:00'
  ),
  (
    (SELECT id FROM users WHERE username = 'alfons.aberg'),
    (SELECT id FROM stations WHERE name = 'Taby'),
    (SELECT id FROM stations WHERE name = 'Hammarby'),
    1,
    17,
    '2026-06-01 21:14:00',
    '2026-06-01 21:21:00'
  ),
  (
    (SELECT id FROM users WHERE username = 'luca.gotti'),
    (SELECT id FROM stations WHERE name = 'Bro Hof'),
    (SELECT id FROM stations WHERE name = 'Hammarby'),
    1,
    22,
    '2026-06-03 08:42:00',
    '2026-06-03 08:48:00'
  ),
  (
    (SELECT id FROM users WHERE username = 'luca.gotti'),
    (SELECT id FROM stations WHERE name = 'Djursholm'),
    (SELECT id FROM stations WHERE name = 'Nacka'),
    1,
    15,
    '2026-06-05 19:11:00',
    '2026-06-05 19:16:00'
  );
