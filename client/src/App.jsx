import { useEffect, useEffectEvent, useRef, useState } from "react";

import {
  createSession,
  destroySession,
  getCurrentSession,
  getNetwork,
  startGame,
  submitGame,
} from "./api";
import stockholmMap from "./assets/large-detailed-road-map-of-stockholm-city-with-buildings.jpg";
import "./App.css";

const EMPTY_LOGIN_FORM = {
  username: "",
  password: "",
};

const STATION_LABEL_LAYOUT = {
  "Bro Hof": { dx: 0, dy: -4.2, anchor: "middle" },
  Solna: { dx: -3.4, dy: -3.8, anchor: "end" },
  Kungsholmen: { dx: -3.6, dy: 4.6, anchor: "end" },
  "Sergels torg": { dx: 0, dy: -4.2, anchor: "middle" },
  Taby: { dx: -1.8, dy: -3.8, anchor: "end" },
  Djursholm: { dx: 3.1, dy: -3.8, anchor: "start" },
  Bergshamra: { dx: -3.6, dy: -3.2, anchor: "end" },
  Lidingo: { dx: 2.8, dy: 4.4, anchor: "start" },
  Gardet: { dx: 3.1, dy: -2.9, anchor: "start" },
  Djurgarden: { dx: 3.2, dy: 5, anchor: "start" },
  Nacka: { dx: 3.1, dy: 4.6, anchor: "start" },
  Hammarby: { dx: 3.2, dy: 4.8, anchor: "start" },
  Haninge: { dx: 3.2, dy: -3, anchor: "start" },
};

function formatCountdown(timeLeftMs) {
  const totalSeconds = Math.max(0, Math.ceil(timeLeftMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function getSegmentLabel(segment) {
  return `${segment.stationAName} - ${segment.stationBName}`;
}

function findStation(network, stationId) {
  return network.stations.find((station) => station.id === stationId) ?? null;
}

function StatusBanner({ tone, children }) {
  return <div className={`status-banner status-banner--${tone}`}>{children}</div>;
}

function NetworkMap({
  network,
  revealLines,
  startStationId = null,
  destinationStationId = null,
}) {
  const linesById = new Map(network.lines.map((line) => [line.id, line]));

  return (
    <div className={`network-map ${revealLines ? "" : "network-map--memory"}`}>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={
          revealLines
            ? "Network map with all metro lines"
            : "Memory map showing only station names"
        }
      >
        <image
          className="network-map__image"
          href={stockholmMap}
          x="0"
          y="0"
          width="100"
          height="100"
          preserveAspectRatio="xMidYMid slice"
        />
        <rect className="network-map__tint" x="0" y="0" width="100" height="100" />
        {revealLines
          ? network.segments.map((segment) => {
              const stationA = findStation(network, segment.stationAId);
              const stationB = findStation(network, segment.stationBId);
              const line = linesById.get(segment.lineId);

              if (!stationA || !stationB || !line) {
                return null;
              }

              return (
                <line
                  key={segment.id}
                  className="network-map__segment"
                  x1={stationA.mapX}
                  y1={stationA.mapY}
                  x2={stationB.mapX}
                  y2={stationB.mapY}
                  stroke={line.color}
                />
              );
            })
          : null}

        {network.stations.map((station) => {
          const isStart = station.id === startStationId;
          const isDestination = station.id === destinationStationId;
          const labelLayout = STATION_LABEL_LAYOUT[station.name] ?? {
            dx: station.mapX <= 65 ? 2.8 : -2.8,
            dy: -3,
            anchor: station.mapX <= 65 ? "start" : "end",
          };

          return (
            <g key={station.id}>
              {(isStart || isDestination) && (
                <circle
                  className={
                    isStart
                      ? "network-map__marker network-map__marker--start"
                      : "network-map__marker network-map__marker--destination"
                  }
                  cx={station.mapX}
                  cy={station.mapY}
                  r={station.isInterchange ? 3.6 : 3.2}
                />
              )}
              <circle
                className={
                  station.isInterchange
                    ? "network-map__station network-map__station--interchange"
                    : "network-map__station"
                }
                cx={station.mapX}
                cy={station.mapY}
                r={station.isInterchange ? 2 : 1.45}
              />
              <text
                className="network-map__label"
                x={station.mapX + labelLayout.dx}
                y={station.mapY + labelLayout.dy}
                textAnchor={labelLayout.anchor}
              >
                {station.name}
              </text>
            </g>
          );
        })}
      </svg>

      {revealLines ? (
        <div className="network-legend">
          {network.lines.map((line) => (
            <div key={line.id} className="network-legend__item">
              <span
                className="network-legend__swatch"
                style={{ backgroundColor: line.color }}
              />
              <span>{line.name} Line</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="network-map__caption">
          Planning mode hides the rails. Only station names remain.
        </p>
      )}
    </div>
  );
}

function GuestView({
  loginForm,
  loginError,
  isBusy,
  onFieldChange,
  onSubmit,
}) {
  return (
    <main className="screen screen--guest">
      <section className="panel panel--hero">
        <p className="eyebrow">Single-player exam project</p>
        <h1>Last Race</h1>
        <p className="hero-copy">
          Memorize the underground, plan a route from a random starting station to
          a random destination, and survive the ride with as many coins as you can.
        </p>
        <div className="phase-strip">
          <div>
            <strong>1. Setup</strong>
            <span>Study the full map before the rails disappear.</span>
          </div>
          <div>
            <strong>2. Planning</strong>
            <span>Build an ordered route within 90 seconds.</span>
          </div>
          <div>
            <strong>3. Execution</strong>
            <span>Random events change your coins on every segment.</span>
          </div>
          <div>
            <strong>4. Result</strong>
            <span>Your score never drops below zero.</span>
          </div>
        </div>
      </section>

      <section className="panel panel--auth">
        <div>
          <p className="eyebrow">Registered players only</p>
          <h2>Sign in to race</h2>
          <p className="muted">
            Anonymous visitors can read the rules, but only authenticated users can
            see the network and start a game.
          </p>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Username
            <input
              type="text"
              name="username"
              value={loginForm.username}
              onChange={onFieldChange}
              autoComplete="username"
              disabled={isBusy}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={onFieldChange}
              autoComplete="current-password"
              disabled={isBusy}
              required
            />
          </label>

          {loginError ? <StatusBanner tone="error">{loginError}</StatusBanner> : null}

          <button type="submit" className="button button--primary" disabled={isBusy}>
            Enter the network
          </button>
        </form>
      </section>
    </main>
  );
}

function SetupView({ user, network, isBusy, onStartGame }) {
  return (
    <main className="screen screen--setup">
      <section className="panel panel--intro">
        <p className="eyebrow">Welcome back, {user.displayName}</p>
        <h1>Study the whole underground before the countdown begins.</h1>
        <p className="muted">
          When you start a round, the client will hide the rails and hand you a
          random origin plus destination. Build the route from memory and submit
          it before the timer runs out.
        </p>

        <div className="bullet-grid">
          <div>
            <strong>20 starting coins</strong>
            <span>Every ride begins with the same budget.</span>
          </div>
          <div>
            <strong>90-second planner</strong>
            <span>Unsubmitted routes are sent automatically at zero.</span>
          </div>
          <div>
            <strong>No segment repeats</strong>
            <span>Stations may repeat, but pairs cannot.</span>
          </div>
        </div>

        <button
          type="button"
          className="button button--primary"
          onClick={onStartGame}
          disabled={isBusy}
        >
          Start planning
        </button>
      </section>

      <section className="panel panel--map">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Setup map</p>
            <h2>All lines visible</h2>
          </div>
        </div>
        <NetworkMap network={network} revealLines />
      </section>
    </main>
  );
}

function PlanningView({
  gameSetup,
  network,
  selectedRoute,
  selectedSegmentIds,
  isBusy,
  timeLeftMs,
  onAddSegment,
  onTrimRoute,
  onRemoveLast,
  onResetRoute,
  onSubmitRoute,
}) {
  const orderedSegments = [...network.segments].sort((segmentA, segmentB) =>
    getSegmentLabel(segmentA).localeCompare(getSegmentLabel(segmentB)),
  );

  return (
    <main className="screen screen--planning">
      <section className="planning-topbar">
        <div className="route-pill route-pill--start">
          <span>Start</span>
          <strong>{gameSetup.startStation.name}</strong>
        </div>
        <div className="route-pill route-pill--destination">
          <span>Destination</span>
          <strong>{gameSetup.destinationStation.name}</strong>
        </div>
        <div className="timer-card">
          <span>Time left</span>
          <strong>{formatCountdown(timeLeftMs)}</strong>
        </div>
      </section>

      <section className="panel panel--map">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Planning map</p>
            <h2>Stations only</h2>
          </div>
          <p className="muted">The connections are gone now. Trust your memory.</p>
        </div>
        <NetworkMap
          network={network}
          revealLines={false}
          startStationId={gameSetup.startStation.id}
          destinationStationId={gameSetup.destinationStation.id}
        />
      </section>

      <section className="planning-columns">
        <section className="panel panel--segments">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Segment bank</p>
              <h2>Pick connected station pairs</h2>
            </div>
            <p className="muted">{orderedSegments.length} total segments</p>
          </div>

          <div className="segment-grid">
            {orderedSegments.map((segment) => {
              const isSelected = selectedSegmentIds.includes(segment.id);

              return (
                <button
                  key={segment.id}
                  type="button"
                  className={`segment-chip ${isSelected ? "segment-chip--used" : ""}`}
                  onClick={() => onAddSegment(segment.id)}
                  disabled={isSelected || isBusy}
                >
                  <span>{getSegmentLabel(segment)}</span>
                  <small>{isSelected ? "Selected" : "Add"}</small>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel panel--route">
          <div className="panel__header">
            <div>
              <p className="eyebrow">Draft route</p>
              <h2>{selectedRoute.length} chosen segments</h2>
            </div>
            <p className="muted">Order matters. Each pair can be used only once.</p>
          </div>

          {selectedRoute.length === 0 ? (
            <div className="empty-state">
              <strong>No route yet.</strong>
              <p>
                Start selecting pairs from the bank. If time runs out, whatever is
                here gets submitted.
              </p>
            </div>
          ) : (
            <ol className="route-list">
              {selectedRoute.map((segment, index) => (
                <li key={`${segment.id}-${index}`}>
                  <span className="route-list__index">{index + 1}</span>
                  <div className="route-list__body">
                    <strong>{getSegmentLabel(segment)}</strong>
                  </div>
                  <button
                    type="button"
                    className="button button--ghost button--compact"
                    onClick={() => onTrimRoute(index)}
                    disabled={isBusy}
                  >
                    Undo to here
                  </button>
                </li>
              ))}
            </ol>
          )}

          <div className="route-actions">
            <button
              type="button"
              className="button button--ghost"
              onClick={onRemoveLast}
              disabled={selectedRoute.length === 0 || isBusy}
            >
              Remove last
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={onResetRoute}
              disabled={selectedRoute.length === 0 || isBusy}
            >
              Clear route
            </button>
            <button
              type="button"
              className="button button--primary"
              onClick={onSubmitRoute}
              disabled={isBusy}
            >
              Submit route
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

function ExecutionView({
  gameSetup,
  network,
  submission,
  executionIndex,
  onAdvance,
}) {
  const revealedSteps = submission.executionSteps.slice(0, executionIndex);
  const currentStep = revealedSteps.at(-1);
  const hasMoreSteps = executionIndex < submission.executionSteps.length;

  return (
    <main className="screen screen--execution">
      <section className="panel panel--map">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Execution</p>
            <h2>
              {gameSetup.startStation.name} to {gameSetup.destinationStation.name}
            </h2>
          </div>
          <p className="muted">
            Events are revealed one segment at a time, in travel order.
          </p>
        </div>
        <NetworkMap
          network={network}
          revealLines
          startStationId={gameSetup.startStation.id}
          destinationStationId={gameSetup.destinationStation.id}
        />
      </section>

      <section className="panel panel--event">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Current segment</p>
            <h2>
              Step {currentStep.order} of {submission.executionSteps.length}
            </h2>
          </div>
          <p className="muted">Coins after this event: {currentStep.coinsAfter}</p>
        </div>

        <div className="event-card">
          <div className="event-card__route">
            <strong>
              {currentStep.fromStationName} to {currentStep.toStationName}
            </strong>
            <span>{currentStep.lineName} Line</span>
          </div>
          <p className="event-card__description">{currentStep.eventDescription}</p>
          <div className="event-card__impact">
            <span
              className={
                currentStep.coinEffect >= 0
                  ? "impact impact--gain"
                  : "impact impact--loss"
              }
            >
              {currentStep.coinEffect >= 0 ? "+" : ""}
              {currentStep.coinEffect} coins
            </span>
            <span>Total: {currentStep.coinsAfter}</span>
          </div>
        </div>

        <div className="execution-log">
          {revealedSteps.map((step) => (
            <article key={step.order} className="execution-log__item">
              <strong>
                {step.order}. {step.fromStationName} to {step.toStationName}
              </strong>
              <span>{step.eventDescription}</span>
            </article>
          ))}
        </div>

        <button type="button" className="button button--primary" onClick={onAdvance}>
          {hasMoreSteps ? "Reveal next segment" : "See final score"}
        </button>
      </section>
    </main>
  );
}

function ResultView({
  gameSetup,
  submission,
  selectedRoute,
  onPlayAgain,
}) {
  return (
    <main className="screen screen--result">
      <section className="panel panel--result-summary">
        <p className="eyebrow">Result</p>
        <h1>{submission.finalScore} coins</h1>
        <p className="hero-copy">
          {submission.routeValid
            ? `You completed the race from ${gameSetup.startStation.name} to ${gameSetup.destinationStation.name}.`
            : "The submitted route was invalid or incomplete, so the run scores zero."}
        </p>

        <div className="bullet-grid">
          <div>
            <strong>Start</strong>
            <span>{gameSetup.startStation.name}</span>
          </div>
          <div>
            <strong>Destination</strong>
            <span>{gameSetup.destinationStation.name}</span>
          </div>
          <div>
            <strong>Segments submitted</strong>
            <span>{selectedRoute.length}</span>
          </div>
        </div>

        {!submission.routeValid ? (
          <StatusBanner tone="error">
            {submission.validationReason}
            {submission.finalStation
              ? ` Final reached station: ${submission.finalStation.name}.`
              : ""}
          </StatusBanner>
        ) : null}

        <button type="button" className="button button--primary" onClick={onPlayAgain}>
          Plan another race
        </button>
      </section>

      <section className="panel panel--result-details">
        <div className="panel__header">
          <div>
            <p className="eyebrow">Journey recap</p>
            <h2>
              {submission.routeValid ? "Executed route" : "Submitted route"}
            </h2>
          </div>
        </div>

        {selectedRoute.length === 0 ? (
          <div className="empty-state">
            <strong>No segments were submitted.</strong>
            <p>The timer or manual submission ended the round before a route was built.</p>
          </div>
        ) : (
          <ol className="route-list route-list--static">
            {selectedRoute.map((segment, index) => (
              <li key={`${segment.id}-${index}`}>
                <span className="route-list__index">{index + 1}</span>
                <div className="route-list__body">
                  <strong>{getSegmentLabel(segment)}</strong>
                </div>
              </li>
            ))}
          </ol>
        )}

        {submission.routeValid ? (
          <div className="result-events">
            {submission.executionSteps.map((step) => (
              <article key={step.order} className="result-events__item">
                <strong>
                  {step.order}. {step.fromStationName} to {step.toStationName}
                </strong>
                <span>{step.eventDescription}</span>
                <small>
                  {step.coinEffect >= 0 ? "+" : ""}
                  {step.coinEffect} coins, total {step.coinsAfter}
                </small>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function App() {
  const [booting, setBooting] = useState(true);
  const [sessionUser, setSessionUser] = useState(null);
  const [network, setNetwork] = useState(null);
  const [screen, setScreen] = useState("guest");
  const [busyLabel, setBusyLabel] = useState("");
  const [pageError, setPageError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN_FORM);
  const [gameSetup, setGameSetup] = useState(null);
  const [selectedSegmentIds, setSelectedSegmentIds] = useState([]);
  const [planningDeadline, setPlanningDeadline] = useState(null);
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [submission, setSubmission] = useState(null);
  const [executionIndex, setExecutionIndex] = useState(0);

  const submitStartedRef = useRef(false);

  function clearRoundState() {
    setGameSetup(null);
    setSelectedSegmentIds([]);
    setPlanningDeadline(null);
    setTimeLeftMs(0);
    setSubmission(null);
    setExecutionIndex(0);
    submitStartedRef.current = false;
  }

  function moveToGuestState(message = "") {
    setSessionUser(null);
    setNetwork(null);
    setScreen("guest");
    clearRoundState();
    setLoginForm(EMPTY_LOGIN_FORM);
    setLoginError("");
    setBusyLabel("");
    setPageError(message);
  }

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      setBooting(true);
      setPageError("");

      try {
        const user = await getCurrentSession();

        if (ignore) {
          return;
        }

        setSessionUser(user);
        setScreen("setup");

        const networkData = await getNetwork();

        if (ignore) {
          return;
        }

        setNetwork(networkData);
      } catch (error) {
        if (ignore) {
          return;
        }

        if (error.status === 401) {
          setSessionUser(null);
          setNetwork(null);
          setScreen("guest");
          clearRoundState();
          setLoginForm(EMPTY_LOGIN_FORM);
          setLoginError("");
          setBusyLabel("");
          setPageError("");
        } else {
          setPageError(error.message);
        }
      } finally {
        if (!ignore) {
          setBooting(false);
        }
      }
    }

    void bootstrap();

    return () => {
      ignore = true;
    };
  }, []);

  async function handleLoginSubmit(event) {
    event.preventDefault();
    setLoginError("");
    setPageError("");
    setBusyLabel("Signing you in");

    try {
      const user = await createSession(loginForm);
      setSessionUser(user);
      setScreen("setup");
      clearRoundState();

      const networkData = await getNetwork();

      setNetwork(networkData);
      setLoginForm(EMPTY_LOGIN_FORM);
    } catch (error) {
      if (error.status === 401) {
        setLoginError(error.message);
      } else {
        setPageError(error.message);
      }
    } finally {
      setBusyLabel("");
    }
  }

  async function handleLogout() {
    setBusyLabel("Signing you out");
    setPageError("");

    try {
      await destroySession();
    } catch {
      // The client can still safely clear local state if the server-side session is gone.
    } finally {
      moveToGuestState();
    }
  }

  async function handleStartGame() {
    setBusyLabel("Assigning your next route");
    setPageError("");
    clearRoundState();

    try {
      const nextGameSetup = await startGame();

      setGameSetup(nextGameSetup);
      setPlanningDeadline(Date.now() + nextGameSetup.planningTimeSeconds * 1000);
      setTimeLeftMs(nextGameSetup.planningTimeSeconds * 1000);
      setScreen("planning");
    } catch (error) {
      if (error.status === 401) {
        moveToGuestState("Your session expired. Please sign in again.");
      } else {
        setPageError(error.message);
      }
    } finally {
      setBusyLabel("");
    }
  }

  async function handleRouteSubmit(mode = "manual") {
    if (!gameSetup || submitStartedRef.current) {
      return;
    }

    submitStartedRef.current = true;
    setBusyLabel(
      mode === "auto"
        ? "Time is up. Sending your current route"
        : "Validating your route",
    );
    setPageError("");

    try {
      const result = await submitGame(selectedSegmentIds);

      setSubmission(result);
      setPlanningDeadline(null);
      setTimeLeftMs(0);
      setBusyLabel("");

      if (result.routeValid && result.executionSteps.length > 0) {
        setExecutionIndex(1);
        setScreen("execution");
      } else {
        setScreen("result");
      }
    } catch (error) {
      submitStartedRef.current = false;
      setBusyLabel("");

      if (error.status === 401) {
        moveToGuestState("Your session expired. Please sign in again.");
      } else {
        setPageError(error.message);
      }
    }
  }

  const onPlanningExpired = useEffectEvent(() => {
    void handleRouteSubmit("auto");
  });

  useEffect(() => {
    if (screen !== "planning" || !planningDeadline) {
      return undefined;
    }

    const timerId = window.setInterval(() => {
      const nextTimeLeftMs = planningDeadline - Date.now();

      if (nextTimeLeftMs <= 0) {
        setTimeLeftMs(0);
        window.clearInterval(timerId);
        onPlanningExpired();
        return;
      }

      setTimeLeftMs(nextTimeLeftMs);
    }, 250);

    return () => {
      window.clearInterval(timerId);
    };
  }, [planningDeadline, screen]);

  function handleLoginFieldChange(event) {
    const { name, value } = event.target;
    setLoginForm((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
  }

  function handleAddSegment(segmentId) {
    setSelectedSegmentIds((currentSegmentIds) => {
      if (currentSegmentIds.includes(segmentId)) {
        return currentSegmentIds;
      }

      return [...currentSegmentIds, segmentId];
    });
  }

  function handleTrimRoute(index) {
    setSelectedSegmentIds((currentSegmentIds) => currentSegmentIds.slice(0, index));
  }

  function handleRemoveLastSegment() {
    setSelectedSegmentIds((currentSegmentIds) => currentSegmentIds.slice(0, -1));
  }

  function handleResetRoute() {
    setSelectedSegmentIds([]);
  }

  function handleAdvanceExecution() {
    if (!submission) {
      return;
    }

    if (executionIndex < submission.executionSteps.length) {
      setExecutionIndex((currentIndex) =>
        Math.min(currentIndex + 1, submission.executionSteps.length),
      );
      return;
    }

    setScreen("result");
  }

  function handlePlayAgain() {
    clearRoundState();
    setBusyLabel("");
    setPageError("");
    setScreen("setup");
  }

  async function handleRetryNetwork() {
    setBusyLabel("Refreshing the network");
    setPageError("");

    try {
      const networkData = await getNetwork();
      setNetwork(networkData);
    } catch (error) {
      if (error.status === 401) {
        moveToGuestState("Your session expired. Please sign in again.");
      } else {
        setPageError(error.message);
      }
    } finally {
      setBusyLabel("");
    }
  }

  const selectedRoute =
    network?.segments
      ? selectedSegmentIds
          .map((segmentId) =>
            network.segments.find((segment) => segment.id === segmentId),
          )
          .filter(Boolean)
      : [];

  if (booting) {
    return (
      <div className="app-shell app-shell--loading">
        <div className="loading-panel">
          <p className="eyebrow">Last Race</p>
          <h1>Loading the underground</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Web Applications I</p>
          <strong className="brand">Last Race</strong>
        </div>

        {sessionUser ? (
          <div className="topbar__actions">
            <div className="topbar__identity">
              <span>Signed in as</span>
              <strong>{sessionUser.displayName}</strong>
            </div>
            <button
              type="button"
              className="button button--ghost"
              onClick={handleLogout}
              disabled={Boolean(busyLabel)}
            >
              Log out
            </button>
          </div>
        ) : (
          <p className="topbar__note">
            Sign in to unlock the map and the game flow.
          </p>
        )}
      </header>

      {pageError ? <StatusBanner tone="error">{pageError}</StatusBanner> : null}
      {busyLabel ? <StatusBanner tone="info">{busyLabel}</StatusBanner> : null}

      {!sessionUser ? (
        <GuestView
          loginForm={loginForm}
          loginError={loginError}
          isBusy={Boolean(busyLabel)}
          onFieldChange={handleLoginFieldChange}
          onSubmit={handleLoginSubmit}
        />
      ) : !network ? (
        <main className="screen screen--fallback">
          <section className="panel panel--auth">
            <p className="eyebrow">Network unavailable</p>
            <h1>The map could not be loaded.</h1>
            <p className="muted">
              The session is still active, but the client needs the underground data
              before a round can begin.
            </p>
            <button
              type="button"
              className="button button--primary"
              onClick={handleRetryNetwork}
              disabled={Boolean(busyLabel)}
            >
              Retry network load
            </button>
          </section>
        </main>
      ) : screen === "setup" ? (
        <SetupView
          user={sessionUser}
          network={network}
          isBusy={Boolean(busyLabel)}
          onStartGame={handleStartGame}
        />
      ) : screen === "planning" && gameSetup ? (
        <PlanningView
          gameSetup={gameSetup}
          network={network}
          selectedRoute={selectedRoute}
          selectedSegmentIds={selectedSegmentIds}
          isBusy={Boolean(busyLabel)}
          timeLeftMs={timeLeftMs}
          onAddSegment={handleAddSegment}
          onTrimRoute={handleTrimRoute}
          onRemoveLast={handleRemoveLastSegment}
          onResetRoute={handleResetRoute}
          onSubmitRoute={() => {
            void handleRouteSubmit();
          }}
        />
      ) : screen === "execution" && gameSetup && submission ? (
        <ExecutionView
          gameSetup={gameSetup}
          network={network}
          submission={submission}
          executionIndex={executionIndex}
          onAdvance={handleAdvanceExecution}
        />
      ) : screen === "result" && gameSetup && submission ? (
        <ResultView
          gameSetup={gameSetup}
          submission={submission}
          selectedRoute={selectedRoute}
          onPlayAgain={handlePlayAgain}
        />
      ) : (
        <main className="screen screen--fallback">
          <section className="panel panel--auth">
            <p className="eyebrow">Round state reset</p>
            <h1>The client lost track of the current round.</h1>
            <p className="muted">
              Jump back to setup and start a new game from a clean state.
            </p>
            <button type="button" className="button button--primary" onClick={handlePlayAgain}>
              Return to setup
            </button>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
