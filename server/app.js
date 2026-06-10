import express from "express";

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

function corsMiddleware(req, res, next) {
  const requestOrigin = req.get("Origin");

  if (requestOrigin === clientOrigin) {
    res.header("Access-Control-Allow-Origin", requestOrigin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
}

function jsonSyntaxErrorHandler(err, req, res, next) {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload." });
  }

  return next(err);
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    error: `Unknown API endpoint: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  const status = err.status ?? 500;
  const message =
    status === 500 ? "Internal server error." : err.message;

  return res.status(status).json({ error: message });
}

const app = express();

app.disable("x-powered-by");

app.use(corsMiddleware);
app.use(express.json());

app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    message: "Last Race API is running.",
  });
});

app.use(jsonSyntaxErrorHandler);
app.use("/api", notFoundHandler);
app.use(errorHandler);

export default app;
