import express from "express";

import { getNetwork } from "../dao/network-dao.js";
import { requireAuthenticatedUser } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.get("/", requireAuthenticatedUser, (req, res) => {
  return res.json(getNetwork());
});

export default router;
