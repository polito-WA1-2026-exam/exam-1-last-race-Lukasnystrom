PRAGMA foreign_keys = ON;

DELETE FROM segments;
DELETE FROM line_stations;

WITH route_stations(line_name, station_name, station_order) AS (
  VALUES
    ('Purple', 'Bro Hof', 1),
    ('Purple', 'Solna', 2),
    ('Purple', 'Kungsholmen', 3),
    ('Purple', 'Sergels torg', 4),

    ('Yellow', 'Taby', 1),
    ('Yellow', 'Djursholm', 2),
    ('Yellow', 'Bergshamra', 3),
    ('Yellow', 'Sergels torg', 4),

    ('Red', 'Bergshamra', 1),
    ('Red', 'Djurgarden', 2),
    ('Red', 'Nacka', 3),
    ('Red', 'Hammarby', 4),

    ('Blue', 'Lidingo', 1),
    ('Blue', 'Gardet', 2),
    ('Blue', 'Sergels torg', 3),
    ('Blue', 'Hammarby', 4),
    ('Blue', 'Haninge', 5)
)
INSERT INTO line_stations (line_id, station_id, station_order)
SELECT lines.id, stations.id, route_stations.station_order
FROM route_stations
JOIN lines ON lines.name = route_stations.line_name
JOIN stations ON stations.name = route_stations.station_name;

WITH route_segments(line_name, station_a_name, station_b_name, segment_order) AS (
  VALUES
    ('Purple', 'Bro Hof', 'Solna', 1),
    ('Purple', 'Solna', 'Kungsholmen', 2),
    ('Purple', 'Kungsholmen', 'Sergels torg', 3),

    ('Yellow', 'Taby', 'Djursholm', 1),
    ('Yellow', 'Djursholm', 'Bergshamra', 2),
    ('Yellow', 'Bergshamra', 'Sergels torg', 3),

    ('Red', 'Bergshamra', 'Djurgarden', 1),
    ('Red', 'Djurgarden', 'Nacka', 2),
    ('Red', 'Nacka', 'Hammarby', 3),

    ('Blue', 'Lidingo', 'Gardet', 1),
    ('Blue', 'Gardet', 'Sergels torg', 2),
    ('Blue', 'Sergels torg', 'Hammarby', 3),
    ('Blue', 'Hammarby', 'Haninge', 4)
)
INSERT INTO segments (line_id, station_a_id, station_b_id, segment_order)
SELECT lines.id, station_a.id, station_b.id, route_segments.segment_order
FROM route_segments
JOIN lines ON lines.name = route_segments.line_name
JOIN stations AS station_a ON station_a.name = route_segments.station_a_name
JOIN stations AS station_b ON station_b.name = route_segments.station_b_name;
