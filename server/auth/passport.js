import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { getUserById, getUserByUsername } from "../dao/users-dao.js";
import { verifyPassword } from "./passwords.js";

function toSessionUser(user) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.display_name,
  };
}

passport.use(
  new LocalStrategy((username, password, done) => {
    try {
      const user = getUserByUsername(username);

      if (!user || !verifyPassword(password, user)) {
        return done(null, false, { message: "Incorrect username or password." });
      }

      return done(null, toSessionUser(user));
    } catch (error) {
      return done(error);
    }
  }),
);

passport.serializeUser((user, done) => {
  return done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  try {
    const user = getUserById(userId);

    if (!user) {
      return done(null, false);
    }

    return done(null, toSessionUser(user));
  } catch (error) {
    return done(error);
  }
});

export default passport;
