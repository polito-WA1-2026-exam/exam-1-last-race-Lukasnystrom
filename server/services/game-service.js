import { getEvents } from "../dao/events-dao.js";
import { getNetwork } from "../dao/network-dao.js";

const INITIAL_COINS = 20;
const PLANNING_TIME_SECONDS = 90;
const MIN_SEGMENTS = 3;

function pickRandomItem(items) {
  const randomIndex = Math.floor(Math.random() * items.length);
  return items[randomIndex];
}

function pickWeightedRandomItem(items, getWeight) {
  const totalWeight = items.reduce(
    (weightSum, item) => weightSum + getWeight(item),
    0,
  );

  if (totalWeight <= 0) {
    const error = new Error("The weighted pool must contain a positive weight.");
    error.status = 500;
    throw error;
  }

  let threshold = Math.random() * totalWeight;

  for (const item of items) {
    threshold -= getWeight(item);

    if (threshold < 0) {
      return item;
    }
  }

  return items.at(-1);
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

function buildLookupMaps(network) {
  return {
    stationsById: new Map(network.stations.map((station) => [station.id, station])),
    linesById: new Map(network.lines.map((line) => [line.id, line])),
    segmentsById: new Map(
      network.segments.map((segment) => [segment.id, segment]),
    ),
  };
}

function getOtherStationId(segment, stationId) {
  if (segment.stationAId === stationId) {
    return segment.stationBId;
  }

  if (segment.stationBId === stationId) {
    return segment.stationAId;
  }

  return null;
}

export function createGameSetup() {
  const network = getNetwork();
  const adjacencyMap = buildAdjacencyMap(network.segments);
  const { stationsById } = buildLookupMaps(network);

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

export function validateRoute({
  startStationId,
  destinationStationId,
  segmentIds,
}) {
  const network = getNetwork();
  const { stationsById, linesById, segmentsById } = buildLookupMaps(network);

  if (!Array.isArray(segmentIds)) {
    return {
      isValid: false,
      reason: "Route must be an ordered list of segment ids.",
      steps: [],
      finalStation: stationsById.get(startStationId) ?? null,
    };
  }

  if (segmentIds.length === 0) {
    return {
      isValid: false,
      reason: "Route is incomplete: no segments were selected.",
      steps: [],
      finalStation: stationsById.get(startStationId) ?? null,
    };
  }

  const startStation = stationsById.get(startStationId);
  const destinationStation = stationsById.get(destinationStationId);

  if (!startStation || !destinationStation) {
    const error = new Error("Game validation received an unknown station id.");
    error.status = 400;
    throw error;
  }

  const usedSegmentIds = new Set();
  const steps = [];
  let currentStation = startStation;
  let currentLineId = null;

  for (const [index, rawSegmentId] of segmentIds.entries()) {
    if (!Number.isInteger(rawSegmentId)) {
      return {
        isValid: false,
        reason: `Route contains an invalid segment id at position ${index + 1}.`,
        steps,
        finalStation: currentStation,
      };
    }

    const segment = segmentsById.get(rawSegmentId);

    if (!segment) {
      return {
        isValid: false,
        reason: `Segment ${rawSegmentId} does not exist in the network.`,
        steps,
        finalStation: currentStation,
      };
    }

    if (usedSegmentIds.has(segment.id)) {
      return {
        isValid: false,
        reason: "A route cannot use the same segment more than once.",
        steps,
        finalStation: currentStation,
      };
    }

    const nextStationId = getOtherStationId(segment, currentStation.id);

    if (nextStationId === null) {
      return {
        isValid: false,
        reason: `Segment ${segment.id} does not continue from ${currentStation.name}.`,
        steps,
        finalStation: currentStation,
      };
    }

    const changesLine =
      currentLineId !== null && currentLineId !== segment.lineId;

    if (changesLine && !currentStation.isInterchange) {
      return {
        isValid: false,
        reason: `You can only change line at interchange stations, and ${currentStation.name} is not one.`,
        steps,
        finalStation: currentStation,
      };
    }

    const nextStation = stationsById.get(nextStationId);
    const line = linesById.get(segment.lineId);

    steps.push({
      order: index + 1,
      segmentId: segment.id,
      lineId: segment.lineId,
      lineName: line?.name ?? null,
      fromStationId: currentStation.id,
      fromStationName: currentStation.name,
      toStationId: nextStation.id,
      toStationName: nextStation.name,
      changesLine,
    });

    usedSegmentIds.add(segment.id);
    currentStation = nextStation;
    currentLineId = segment.lineId;
  }

  if (currentStation.id !== destinationStation.id) {
    return {
      isValid: false,
      reason: `Route is incomplete: it ends at ${currentStation.name} instead of ${destinationStation.name}.`,
      steps,
      finalStation: currentStation,
    };
  }

  return {
    isValid: true,
    reason: null,
    steps,
    finalStation: currentStation,
  };
}

export function drawWeightedEvent(events = getEvents()) {
  if (events.length === 0) {
    const error = new Error("The event pool is empty.");
    error.status = 500;
    throw error;
  }

  return pickWeightedRandomItem(events, (event) => event.weight);
}

export function drawWeightedEvents(count, events = getEvents()) {
  return Array.from({ length: count }, () => drawWeightedEvent(events));
}

export function simulateExecution(routeSteps, initialCoins = INITIAL_COINS) {
  const drawnEvents = drawWeightedEvents(routeSteps.length);
  let coins = initialCoins;

  const executionSteps = routeSteps.map((step, index) => {
    const event = drawnEvents[index];
    coins += event.coinEffect;

    return {
      ...step,
      eventId: event.id,
      eventDescription: event.description,
      coinEffect: event.coinEffect,
      coinsAfter: coins,
    };
  });

  return {
    initialCoins,
    executionSteps,
    finalCoins: coins,
    finalScore: Math.max(0, coins),
  };
}

export function evaluateRouteSubmission({
  startStationId,
  destinationStationId,
  segmentIds,
}) {
  const validation = validateRoute({
    startStationId,
    destinationStationId,
    segmentIds,
  });

  if (!validation.isValid) {
    return {
      routeValid: false,
      validationReason: validation.reason,
      steps: validation.steps,
      finalStation: validation.finalStation,
      initialCoins: INITIAL_COINS,
      executionSteps: [],
      finalCoins: 0,
      finalScore: 0,
    };
  }

  const simulation = simulateExecution(validation.steps, INITIAL_COINS);

  return {
    routeValid: true,
    validationReason: null,
    steps: validation.steps,
    finalStation: validation.finalStation,
    ...simulation,
  };
}
