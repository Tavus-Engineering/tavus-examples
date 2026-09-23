import { useEffect, useRef, useState, type FormEvent } from "react";
import { PromptSection } from "./components/PromptSection.tsx";
import { PROMPT_VARIANTS } from "./prompt.ts";
import {
  formatDuration,
  transcriptAsText,
  type Screen,
  type Utterance,
} from "./session.ts";
import { DEPLOYMENT_ID, OVERRIDE_CONFIG, conversationalContext, customGreeting } from "./constants.ts";
import { useSession } from "./use-session.ts";

function TopBar({ screen }: { screen: Screen }) {
  return (
    <header className="topbar">
      <span className="brand">
        <span className="brand-mark" />
        Acme
      </span>
      {screen.kind === "call" && (
        <span className="topbar-note">Session with {screen.firstName}</span>
      )}
      {screen.kind === "summary" && <span className="topbar-note">Session complete</span>}
    </header>
  );
}

function Intro({
  ready,
  firstName,
  onName,
  onWarmUp,
  onStart,
}: {
  ready: boolean;
  firstName: string;
  onName: (value: string) => void;
  onWarmUp: (firstName: string) => void;
  onStart: (firstName: string) => void;
}) {
  const trimmed = firstName.trim();
  useEffect(() => {
    if (trimmed === "") return;
    const timer = setTimeout(() => onWarmUp(trimmed), 1200);
    return () => clearTimeout(timer);
  }, [trimmed, onWarmUp]);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (trimmed) onStart(trimmed);
  }
  return (
    <section className="intro">
      <p className="eyebrow">Lorem ipsum</p>
      <h1>Lorem ipsum dolor sit amet, consectetur.</h1>
      <p className="lede">
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
      </p>
      <form className="intro-form" onSubmit={submit}>
        <label htmlFor="first-name">Your first name</label>
        <input
          id="first-name"
          autoComplete="given-name"
          placeholder="e.g. Ada"
          value={firstName}
          onChange={(event) => onName(event.target.value)}
        />
        <button type="submit" className="primary" disabled={!ready || firstName.trim() === ""}>
          {ready ? "Start session" : "Loading agent…"}
        </button>
      </form>
    </section>
  );
}

function useElapsed(startedAt: number | null): string {
  const [ms, setMs] = useState(0);
  useEffect(() => {
    if (startedAt === null) return;
    const tick = () => setMs(Date.now() - startedAt);
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [startedAt]);
  return startedAt === null ? "" : formatDuration(ms);
}

function Transcript({ firstName, lines }: { firstName: string; lines: Utterance[] }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [lines.length]);
  return (
    <ol className="transcript">
      {lines.length === 0 && <li className="transcript-empty">The transcript appears here as you talk.</li>}
      {lines.map((line, index) => (
        <li key={index} data-role={line.role}>
          <span className="who">{line.role === "user" ? firstName : "Agent"}</span>
          <p>{line.speech}</p>
        </li>
      ))}
      <div ref={endRef} />
    </ol>
  );
}

function CallSidebar({
  firstName,
  startedAt,
  lines,
  onEnd,
}: {
  firstName: string;
  startedAt: number | null;
  lines: Utterance[];
  onEnd: () => void;
}) {
  const elapsed = useElapsed(startedAt);
  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <span className="pill" data-live={startedAt !== null}>
          <span className="dot" />
          {startedAt === null ? "Connecting" : `Live · ${elapsed}`}
        </span>
        <button type="button" className="danger" disabled={startedAt === null} onClick={onEnd}>
          End session
        </button>
      </div>
      <h2>Live transcript</h2>
      <Transcript firstName={firstName} lines={lines} />
    </aside>
  );
}

function Summary({
  firstName,
  durationMs,
  lines,
  onReset,
}: {
  firstName: string;
  durationMs: number;
  lines: Utterance[];
  onReset: () => void;
}) {
  function download() {
    const blob = new Blob([transcriptAsText(firstName, lines)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "session-transcript.txt";
    link.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="summary">
      <p className="eyebrow">Session complete</p>
      <h1>Nice work, {firstName}.</h1>
      <p className="lede">
        {formatDuration(durationMs)} on the call · {lines.length}{" "}
        {lines.length === 1 ? "line" : "lines"} of transcript.
      </p>
      <div className="card">
        <div className="card-head">
          <span className="eyebrow">Transcript</span>
          <button type="button" className="ghost" onClick={download} disabled={lines.length === 0}>
            Download .txt
          </button>
        </div>
        <Transcript firstName={firstName} lines={lines} />
      </div>
      <button type="button" className="primary" onClick={onReset}>
        Back to start
      </button>
    </section>
  );
}

function SessionApp() {
  const { session, ready, screen, transcript, warmUp, start, end, reset } = useSession();
  const [firstName, setFirstName] = useState("");
  const name = firstName.trim();
  const inCall = screen.kind === "call";

  return (
    <>
      <TopBar screen={screen} />
      <main className="page" data-screen={screen.kind}>
        {screen.kind === "intro" && (
          <Intro
            ready={ready}
            firstName={firstName}
            onName={setFirstName}
            onWarmUp={warmUp}
            onStart={start}
          />
        )}
        <div className="call" hidden={!inCall}>
          <div className="stage" key={session}>
            <tavus-embed
              deployment-id={DEPLOYMENT_ID}
              override-config={OVERRIDE_CONFIG}
              conversational-context={name ? conversationalContext(name) : undefined}
              custom-greeting={name ? customGreeting(name) : undefined}
            />
          </div>
          {inCall && (
            <CallSidebar
              firstName={screen.firstName}
              startedAt={screen.startedAt}
              lines={transcript}
              onEnd={end}
            />
          )}
        </div>
        {screen.kind === "summary" && (
          <Summary
            firstName={screen.firstName}
            durationMs={screen.durationMs}
            lines={transcript}
            onReset={() => {
              setFirstName("");
              reset();
            }}
          />
        )}
      </main>
    </>
  );
}

function MissingDeployment() {
  return (
    <main className="page">
      <section className="intro">
        <h1>No deployment id.</h1>
        <p className="lede">
          Paste your deployment id into <code>src/constants.ts</code>, then restart the dev server.
        </p>
      </section>
    </main>
  );
}

export function App() {
  return (
    <>
      {DEPLOYMENT_ID ? <SessionApp /> : <MissingDeployment />}
      <div className="build">
        <PromptSection
          eyebrow="Build this"
          title="Run the same three-screen session on your site"
          intro="Copy the prompt into your coding agent. It covers the name step, passing it to the agent, the live transcript from protocol events, and the summary screen."
          variants={PROMPT_VARIANTS}
        />
      </div>
    </>
  );
}
