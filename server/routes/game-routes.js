import express from "express";

import { requireAuthenticatedUser } from "../middlewares/auth-middleware.js";
import { createGameSetup } from "../services/game-service.js";

const router = express.Router();

router.post("/", requireAuthenticatedUser, (req, res, next) => {
  try {
    const gameSetup = createGameSetup();
    return res.status(201).json(gameSetup);
  } catch (error) {
    return next(error);
  }
});

export default router;
