import { getNetwork } from "../dao/network-dao.js";

const INITIAL_COINS = 20;
const PLANNING_TIME_SECONDS = 90;
const MIN_SEGMENTS = 3;

function pickRandomItem(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function buildAdjacencyMap(segments) {
  const adjacencyMap = new Map();

  for (const segment of segments) {
    if (!adjacencyMap.has(segment.stationAId)) {
      adjacencyMap.set(segment.stationAId, new Set());
    }

    if (!adjacencyMap.has(segment.stationBId)) {
      adjacencyMap.set(segment.stationBId, new Set());
    }

    adjacencyMap.get(segment.stationAId).add(segment.stationBId);
    adjacencyMap.get(segment.stationBId).add(segment.stationAId);
  }

  return adjacencyMap;
}

function shortestDistancesFrom(startStationId, adjacencyMap) {
  const distances = new Map([[startStationId, 0]]);
  const queue = [startStationId];

  while (queue.length > 0) {
    const currentStationId = queue.shift();
    const currentDistance = distances.get(currentStationId);
    const neighbors = adjacencyMap.get(currentStationId) ?? [];

    for (const neighborId of neighbors) {
      if (distances.has(neighborId)) {
        continue;
      }

      distances.set(neighborId, currentDistance + 1);
      queue.push(neighborId);
    }
  }

  return distances;
}

export function createGameSetup() {
  const network = getNetwork();
  const adjacencyMap = buildAdjacencyMap(network.segments);
  const stationsById = new Map(
    network.stations.map((station) => [station.id, station]),
  );

  const validStartStations = network.stations
    .map((station) => {
      const distances = shortestDistancesFrom(station.id, adjacencyMap);
      const validDestinations = Array.from(distances.entries())
        .filter(([, distance]) => distance >= MIN_SEGMENTS)
        .map(([stationId, distance]) => ({
          station: stationsById.get(stationId),
          distance,
        }));

      return {
        station,
        validDestinations,
      };
    })
    .filter(({ validDestinations }) => validDestinations.length > 0);

  if (validStartStations.length === 0) {
    const error = new Error("The network does not contain any valid game routes.");
    error.status = 500;
    throw error;
  }

  const { station: startStation, validDestinations } =
    pickRandomItem(validStartStations);
  const {
    station: destinationStation,
    distance: shortestDistance,
  } = pickRandomItem(validDestinations);

  return {
    startStation,
    destinationStation,
    shortestDistance,
    initialCoins: INITIAL_COINS,
    planningTimeSeconds: PLANNING_TIME_SECONDS,
  };
}
