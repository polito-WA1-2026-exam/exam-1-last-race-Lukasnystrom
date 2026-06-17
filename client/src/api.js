const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api";

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("Content-Type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  return payload;
}

export function getCurrentSession() {
  return request("/sessions/current");
}

export function createSession(credentials) {
  return request("/sessions", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function destroySession() {
  return request("/sessions/current", {
    method: "DELETE",
  });
}

export function getNetwork() {
  return request("/network");
}

export function startGame() {
  return request("/games", {
    method: "POST",
  });
}

export function submitGame(segmentIds) {
  return request("/games/submit", {
    method: "POST",
    body: JSON.stringify({ segmentIds }),
  });
}

export { ApiError };
