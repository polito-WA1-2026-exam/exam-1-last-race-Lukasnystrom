INSERT INTO lines (name, color) VALUES
  ('Purple', '#7B3FF2'),
  ('Yellow', '#F2C94C'),
  ('Red', '#D72638'),
  ('Blue', '#2F80ED')
ON CONFLICT(name) DO UPDATE SET
  color = excluded.color;

INSERT INTO stations (name, map_x, map_y) VALUES
  ('Djursholm', 66, 12),
  ('Taby', 49, 8),
  ('Bergshamra', 40, 24),
  ('Lidingo', 88, 26),
  ('Nacka', 84, 68),
  ('Gardet', 68, 40),
  ('Hammarby', 58, 79),
  ('Solna', 24, 29),
  ('Sergels torg', 45, 52),
  ('Kungsholmen', 20, 49),
  ('Djurgarden', 74, 53),
  ('Haninge', 66, 94),
  ('Bro Hof', 8, 20)
ON CONFLICT(name) DO UPDATE SET

  map_x = excluded.map_x,
  map_y = excluded.map_y;
