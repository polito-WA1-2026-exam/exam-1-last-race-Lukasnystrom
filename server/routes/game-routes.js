import express from "express";

import { getRanking, insertCompletedGame } from "../dao/games-dao.js";
import { requireAuthenticatedUser } from "../middlewares/auth-middleware.js";
import {
  createGameSetup,
  evaluateRouteSubmission,
} from "../services/game-service.js";

const router = express.Router();

router.get("/ranking", requireAuthenticatedUser, (req, res) => {
  return res.json(getRanking());
});

router.post("/", requireAuthenticatedUser, (req, res, next) => {
  try {
    const gameSetup = createGameSetup();

    req.session.activeGame = {
      startStationId: gameSetup.startStation.id,
      destinationStationId: gameSetup.destinationStation.id,
      startedAt: new Date().toISOString(),
    };

    return res.status(201).json(gameSetup);
  } catch (error) {
    return next(error);
  }
});

router.post("/submit", requireAuthenticatedUser, (req, res, next) => {
  const activeGame = req.session.activeGame;
  const { segmentIds } = req.body ?? {};

  if (!activeGame) {
    return res.status(409).json({
      error: "There is no active game to submit.",
    });
  }

  if (!Array.isArray(segmentIds)) {
    return res.status(400).json({
      error: "segmentIds must be an array of segment ids.",
    });
  }

  try {
    const result = evaluateRouteSubmission({
      startStationId: activeGame.startStationId,
      destinationStationId: activeGame.destinationStationId,
      segmentIds,
    });

    const gameId = insertCompletedGame({
      userId: req.user.id,
      startStationId: activeGame.startStationId,
      destinationStationId: activeGame.destinationStationId,
      routeValid: result.routeValid,
      finalScore: result.finalScore,
      startedAt: activeGame.startedAt,
    });

    delete req.session.activeGame;

    return res.status(201).json({
      gameId,
      startStationId: activeGame.startStationId,
      destinationStationId: activeGame.destinationStationId,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
