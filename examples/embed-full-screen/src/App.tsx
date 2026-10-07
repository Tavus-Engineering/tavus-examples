import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router";
import { PromptSection } from "./components/PromptSection.tsx";
import { PROMPT } from "./prompt.ts";
import {
  DEPLOYMENT_ID,
  NEXT_STEPS,
  OVERRIDE_CONFIG,
  TOPICS,
  conversationalContext,
  customGreeting,
  formatDuration,
  type TopicId,
} from "./constants.ts";
import { useCall, type Intake } from "./use-call.ts";

function Header() {
  return (
    <header className="header">
      <Link className="brand" to="/">
        <span className="brand-mark" />
        Acme
      </Link>
      <span className="mono">Lorem ipsum · dolor sit</span>
    </header>
  );
}

function IntakePage({
  ready,
  onChange,
  onWarmUp,
  onContinue,
}: {
  ready: boolean;
  onChange: (intake: Intake) => void;
  onWarmUp: (intake: Intake) => void;
  onContinue: (intake: Intake) => void;
}) {
  const [firstName, setFirstName] = useState("");
  const [topic, setTopic] = useState<TopicId>(TOPICS[0].id);
  const trimmed = firstName.trim();
  const topicLabel = TOPICS.find((option) => option.id === topic)?.label ?? "";

  useEffect(() => {
    onChange({ firstName: trimmed, topic: topicLabel });
  }, [trimmed, topicLabel, onChange]);

  useEffect(() => {
    if (trimmed.length < 2) return;
    const timer = setTimeout(() => onWarmUp({ firstName: trimmed, topic: topicLabel }), 1200);
    return () => clearTimeout(timer);
  }, [trimmed, topicLabel, onWarmUp]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (trimmed) onContinue({ firstName: trimmed, topic: topicLabel });
  }

  return (
    <>
      <Header />
      <main className="page">
        <section className="intake">
          <span className="eyebrow">Step 1 of 3</span>
          <h1>Lorem ipsum dolor sit amet.</h1>
          <p className="lede">
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Tell us a little,
            talk it through on the next page, and get your next steps on the last one.
          </p>
          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>Your first name</span>
              <input
                id="first-name"
                autoComplete="given-name"
                placeholder="e.g. Ada"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
              />
            </label>
            <fieldset className="topics">
              <legend>What is this about?</legend>
              {TOPICS.map((option) => (
                <label key={option.id} className="topic" data-selected={option.id === topic}>
                  <input
                    type="radio"
                    name="topic"
                    value={option.id}
                    checked={option.id === topic}
                    onChange={() => setTopic(option.id)}
                  />
                  <span className="topic-label">{option.label}</span>
                  <span className="topic-hint">{option.hint}</span>
                </label>
              ))}
            </fieldset>
            <button type="submit" className="primary" disabled={!trimmed || !ready}>
              {ready ? "Continue to the call" : "Loading the agent"}
            </button>
          </form>
        </section>
        <PromptSection
          eyebrow="Build this"
          title="Give the call a page of its own"
          intro="Copy this prompt into your coding agent (Cursor, Claude Code, Lovable, Replit). It asks what you want to build, explains what the element can do, and points at the docs and these examples. Say you want to start from the embed-full-screen example."
          text={PROMPT}
        />
      </main>
    </>
  );
}

function NextStepsPage({
  intake,
  durationMs,
  onFinish,
}: {
  intake: Intake;
  durationMs: number;
  onFinish: () => void;
}) {
  return (
    <>
      <Header />
      <main className="page">
        <section className="next">
          <span className="eyebrow">Step 3 of 3</span>
          <h1>Here is what we suggest{intake.firstName ? `, ${intake.firstName}` : ""}.</h1>
          <p className="lede">
            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </p>
          <dl className="summary">
            <div>
              <dt>Topic</dt>
              <dd>{intake.topic || "Lorem ipsum"}</dd>
            </div>
            <div>
              <dt>Call length</dt>
              <dd>{formatDuration(durationMs)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>Completed</dd>
            </div>
          </dl>
          <ol className="steps">
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="primary" onClick={onFinish}>
            Finish
          </button>
        </section>
      </main>
    </>
  );
}

function MissingDeployment() {
  return (
    <>
      <Header />
      <main className="page">
        <section className="intake">
          <h1>No deployment id.</h1>
          <p className="lede">
            Paste your deployment id into <code>src/constants.ts</code>, then restart the dev
            server.
          </p>
        </section>
      </main>
    </>
  );
}

function CallApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, ready, durationMs, warmUp, start, abandon, reset } = useCall();
  const [intake, setIntake] = useState<Intake>({ firstName: "", topic: "" });
  const onCall = location.pathname === "/call";

  function continueToCall(next: Intake) {
    setIntake(next);
    start(next);
    navigate("/call");
  }

  function back() {
    abandon();
    navigate("/");
  }

  function finish() {
    reset();
    navigate("/");
  }

  return (
    <>
      <div key={session} className="stage" hidden={!onCall}>
        <tavus-embed
          deployment-id={DEPLOYMENT_ID}
          layout="full-screen"
          override-config={OVERRIDE_CONFIG}
          conversational-context={
            intake.firstName ? conversationalContext(intake.firstName, intake.topic) : undefined
          }
          custom-greeting={intake.firstName ? customGreeting(intake.firstName) : undefined}
        />
        {onCall && (
          <div className="call-chrome">
            <span className="step-chip">Step 2 of 3</span>
            <button type="button" className="back" onClick={back}>
              Back
            </button>
          </div>
        )}
      </div>
      <Routes>
        <Route
          path="/"
          element={
            <IntakePage
              ready={ready}
              onChange={setIntake}
              onWarmUp={warmUp}
              onContinue={continueToCall}
            />
          }
        />
        <Route path="/call" element={intake.firstName ? null : <Navigate to="/" replace />} />
        <Route
          path="/next-steps"
          element={
            intake.firstName ? (
              <NextStepsPage intake={intake} durationMs={durationMs} onFinish={finish} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export function App() {
  if (!DEPLOYMENT_ID) return <MissingDeployment />;
  return <CallApp />;
}
