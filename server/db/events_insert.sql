PRAGMA foreign_keys = ON;

DELETE FROM events;

INSERT INTO events (description, coin_effect, weight) VALUES
  ('Quiet journey', 0, 10),
  ('Ticket control', -2, 5),
  ('Signal fault', -2, 5),
  ('Doors stay open just long enough', 2, 5),
  ('Tourist crowd blocks passage', -1, 8),
  ('Funny subway performance', 1, 8),
  ('Stumbling on a friend', 3, 3),
  ('Drunk guy pukes on you', -4, 1),
  ('Fun conversation with a war veteran', 2, 5),
  ('Promotion call from work', 4, 1),
  ('Missing the train', -3, 3);
