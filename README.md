# Exam #1: "Last Race"
## Student: Lukas Nystrom

## React Client Application Routes

- Route `/`: single-page app entry point. After login it switches between the game screens inside the app: setup, planning, execution, result, and ranking. No extra browser routes are used.

## API Server

- `GET /api/health`
  - Returns a health check response showing that the API is running.

- `POST /api/sessions`
  - Request body: `{ "username": string, "password": string }`
  - Logs in a user and creates the session cookie.
  - Response body: the authenticated user object with `id`, `username`, and `displayName`.

- `GET /api/sessions/current`
  - Returns the current authenticated user.
  - Responds with `401` if no session exists.

- `DELETE /api/sessions/current`
  - Logs out the current user and clears the session.

- `GET /api/network`
  - Requires authentication.
  - Returns the network data: stations, lines, line-stations, and segments.

- `POST /api/games`
  - Requires authentication.
  - Creates a new game setup with a random start station and destination station.
  - Response body includes the start station, destination station, shortest distance, initial coins, and planning time.

- `POST /api/games/submit`
  - Requires authentication.
  - Request body: `{ "segmentIds": number[] }`
  - Validates the submitted route, simulates the journey events, stores the completed game, and returns the result.

- `GET /api/games/ranking`
  - Requires authentication.
  - Returns the ranking table with each player's best score and number of games played.

## Database Tables

- `users`: login accounts, display names, password hashes, salts, and creation time.
- `stations`: stations in the network with map coordinates.
- `lines`: metro lines with a name and display color.
- `line_stations`: ordered station membership for each line.
- `segments`: connected station pairs for each line, in travel order.
- `events`: random gameplay events with coin effects and weights.
- `games`: completed game runs, including start and destination stations, route validity, and final score.

## Main React Components

- `App` (`client/src/App.jsx`): top-level app state, session handling, game flow, and screen switching.

- `GuestView` (`client/src/App.jsx`): login screen and rule overview for unauthenticated users.

- `SetupView` (`client/src/App.jsx`): pre-game screen where the player studies the full map before starting a round.

- `PlanningView` (`client/src/App.jsx`): route-building screen with the hidden-line map and clickable segment bank.

- `ExecutionView` (`client/src/App.jsx`): step-by-step reveal of the simulated route and random events.

- `ResultView` (`client/src/App.jsx`): final score view and route summary after a round.

- `RankingView` (`client/src/App.jsx`): leaderboard view for the best stored scores.

- `NetworkMap` (`client/src/App.jsx`): SVG-based map renderer that shows stations, labels, 

segments, and start/destination markers.
- `StatusBanner` (`client/src/App.jsx`): reusable message banner for errors and info messages.

(only the main components are listed here; small helper functions are skipped)

## Screenshot

Screenshot file not included yet. Add `img/screenshot.jpg` before submission so this section can display the finished app.

## Users Credentials

- `mona.beck`, `lastrace123`
- `zibra.karling`, `lastrace123`
- `alfons.aberg`, `lastrace123`
- `alex.van.jager`, `lastrace123`
- `herman.carlsson`, `lastrace123`
- `luca.gotti`, `lastrace123`
- `lebron.james`, `lastrace123`
- `tintin.sven`, `lastrace123`

## Use of AI Tools

I used Codex to help clarify code structure, debugging, help to get an clean structured code, and to help fill in the README.md 

I used ChatGPT, to draft some code. 


