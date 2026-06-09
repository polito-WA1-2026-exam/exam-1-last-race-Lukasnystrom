INSERT INTO lines (name, color) VALUES
  ('Purple', '#7B3FF2'),
  ('Yellow', '#F2C94C'),
  ('Red', '#D72638'),
  ('Blue', '#2F80ED')
ON CONFLICT(name) DO UPDATE SET
  color = excluded.color;

INSERT INTO stations (name, map_x, map_y) VALUES
  ('Djursholm', 63, 18),
  ('Taby', 55, 8),
  ('Bergshamra', 46, 28),
  ('Lidingo', 82, 34),
  ('Nacka', 76, 64),
  ('Gardet', 66, 42),
  ('Hammarby', 57, 70),
  ('Solna', 35, 32),
  ('Sergels torg', 48, 48),
  ('Kungsholmen', 34, 50),
  ('Djurgarden', 68, 54),
  ('Haninge', 62, 90),
  ('Bro Hof', 12, 22)
ON CONFLICT(name) DO UPDATE SET

  map_x = excluded.map_x,
  map_y = excluded.map_y;
