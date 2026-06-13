import express from "express";
import passport from "../auth/passport.js";

const router = express.Router();
const sessionCookieName = "last-race.sid";

function normalizeUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}

router.post("/", (req, res, next) => {
  const { username, password } = req.body ?? {};

  if (
    typeof username !== "string" ||
    username.trim() === "" ||
    typeof password !== "string" ||
    password === ""
  ) {
    return res.status(400).json({
      error: "Username and password are required.",
    });
  }

  return passport.authenticate("local", (error, user, info) => {
    if (error) {
      return next(error);
    }

    if (!user) {
      return res.status(401).json({
        error: info?.message ?? "Authentication failed.",
      });
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        return next(loginError);
      }

      return res.status(201).json(normalizeUser(user));
    });
  })(req, res, next);
});

router.get("/current", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated." });
  }

  return res.json(normalizeUser(req.user));
});

router.delete("/current", (req, res, next) => {
  const finishLogout = () => {
    res.clearCookie(sessionCookieName);
    return res.sendStatus(204);
  };

  if (!req.isAuthenticated()) {
    return finishLogout();
  }

  return req.logout((logoutError) => {
    if (logoutError) {
      return next(logoutError);
    }

    return req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      return finishLogout();
    });
  });
});

export default router;
