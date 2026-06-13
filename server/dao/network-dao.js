import db from "../db/database.js";

const getStationsStatement = db.prepare(`
  SELECT
    stations.id,
    stations.name,
    stations.map_x AS mapX,
    stations.map_y AS mapY,
    COUNT(line_stations.line_id) AS servedByLines
  FROM stations
  LEFT JOIN line_stations ON line_stations.station_id = stations.id
  GROUP BY stations.id, stations.name, stations.map_x, stations.map_y
  ORDER BY stations.id
`);

const getLinesStatement = db.prepare(`
  SELECT id, name, color
  FROM lines
  ORDER BY id
`);

const getLineStationsStatement = db.prepare(`
  SELECT
    line_id AS lineId,
    station_id AS stationId,
    station_order AS stationOrder
  FROM line_stations
  ORDER BY line_id, station_order
`);

const getSegmentsStatement = db.prepare(`
  SELECT
    segments.id,
    segments.line_id AS lineId,
    segments.station_a_id AS stationAId,
    station_a.name AS stationAName,
    segments.station_b_id AS stationBId,
    station_b.name AS stationBName,
    segments.segment_order AS segmentOrder
  FROM segments
  JOIN stations AS station_a ON station_a.id = segments.station_a_id
  JOIN stations AS station_b ON station_b.id = segments.station_b_id
  ORDER BY segments.line_id, segments.segment_order
`);

export function getNetwork() {
  const stations = getStationsStatement.all().map((station) => ({
    id: station.id,
    name: station.name,
    mapX: station.mapX,
    mapY: station.mapY,
    isInterchange: station.servedByLines > 1,
  }));

  return {
    stations,
    lines: getLinesStatement.all(),
    lineStations: getLineStationsStatement.all(),
    segments: getSegmentsStatement.all(),
  };
}
