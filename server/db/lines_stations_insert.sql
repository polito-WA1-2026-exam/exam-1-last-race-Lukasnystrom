INSERT INTO lines (name, color) VALUES
  ('Purple', '#7B3FF2'),
  ('Yellow', '#F2C94C'),
  ('Red', '#D72638'),
  ('Blue', '#2F80ED')
ON CONFLICT(name) DO UPDATE SET
  color = excluded.color;

INSERT INTO stations (name, map_x, map_y) VALUES
  ('Djursholm', 58, 8),
  ('Taby', 48, 5),
  ('Bergshamra', 33, 16),
  ('Lidingo', 91, 11),
  ('Nacka', 89, 78),
  ('Gardet', 73, 32),
  ('Hammarby', 61, 73),
  ('Solna', 14, 12),
  ('Sergels torg', 49, 38),
  ('Kungsholmen', 30, 46),
  ('Djurgarden', 78, 54),
  ('Haninge', 66, 96),
  ('Bro Hof', 6, 25)
ON CONFLICT(name) DO UPDATE SET

  map_x = excluded.map_x,
  map_y = excluded.map_y;
