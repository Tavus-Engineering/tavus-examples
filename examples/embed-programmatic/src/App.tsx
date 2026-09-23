import { useEffect, useRef, useState } from "react";
import { PromptSection } from "./components/PromptSection.tsx";
import { PROMPT_VARIANTS } from "./prompt.ts";
import { DEPLOYMENT_ID, OVERRIDE_CONFIG, SUGGESTED_QUESTIONS } from "./constants.ts";
import { formatDuration, isElementMounted, type CallPhase } from "./call-phase.ts";
import { useTavusCall } from "./use-tavus-call.ts";

function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        Acme
      </a>
      <nav>
        <a href="#call">Support</a>
        <a href="#features">Features</a>
        <a href="#build-this">Build this</a>
      </nav>
      <span className="mono">Lorem ipsum · dolor sit amet</span>
    </header>
  );
}

function useElapsed(phase: CallPhase): string {
  const [elapsedMs, setElapsedMs] = useState(0);
  useEffect(() => {
    if (phase.kind !== "live") return;
    const tick = () => setElapsedMs(Date.now() - phase.startedAt);
    tick();
    const timer = setInterval(tick, 500);
    return () => clearInterval(timer);
  }, [phase]);
  if (phase.kind !== "live") return "";
  return formatDuration(elapsedMs);
}

function StatusPill({ phase }: { phase: CallPhase }) {
  const elapsed = useElapsed(phase);
  const label = {
    idle: "Agent available",
    opening: "Loading agent",
    starting: "Connecting",
    live: `Live · ${elapsed}`,
    ended: `Ended · ${formatDuration(phase.kind === "ended" ? phase.durationMs : 0)}`,
    error: "Something went wrong",
  }[phase.kind];
  return (
    <span className="pill mono" data-phase={phase.kind}>
      <span className="pill-dot" />
      {label}
    </span>
  );
}

function Hero({ phase, onOpen }: { phase: CallPhase; onOpen: () => void }) {
  return (
    <section className="hero" id="call">
      <StatusPill phase={phase} />
      <h1>
        Lorem ipsum
        <br />
        dolor sit amet.
      </h1>
      <p className="lede">
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris.
      </p>
      <div className="row">
        <button
          type="button"
          className="primary"
          disabled={isElementMounted(phase)}
          onClick={onOpen}
        >
          Start a call
        </button>
        <span className="mono">Lorem ipsum · dolor sit amet</span>
      </div>
    </section>
  );
}

function CallDialog({
  phase,
  onClose,
  onAsk,
}: {
  phase: CallPhase;
  onClose: () => void;
  onAsk: (text: string) => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const live = phase.kind === "live";
  const finished = phase.kind === "ended" || phase.kind === "error";

  return (
    <dialog ref={dialogRef} className="call-dialog" onClose={onClose}>
      <div className="dialog-stage">
        <tavus-embed deployment-id={DEPLOYMENT_ID} override-config={OVERRIDE_CONFIG} />
        {finished && (
          <div className="dialog-after">
            <p>
              {phase.kind === "error"
                ? phase.message
                : `Call ended after ${formatDuration(phase.durationMs)}.`}
            </p>
            <button type="button" className="primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
      <div className="dialog-bar">
        <StatusPill phase={phase} />
        <div className="chips">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button key={question} type="button" disabled={!live} onClick={() => onAsk(question)}>
              {question}
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}

const FEATURES = [
  ["01", "Lorem ipsum dolor", "Consectetur adipiscing elit, sed do eiusmod tempor incididunt."],
  ["02", "Ut enim ad minim", "Quis nostrud exercitation ullamco laboris nisi ut aliquip."],
  ["03", "Duis aute irure", "In reprehenderit in voluptate velit esse cillum dolore."],
];

function Features() {
  return (
    <section className="features" id="features">
      {FEATURES.map(([index, title, copy]) => (
        <div key={index}>
          <span className="mono">{index}</span>
          <h2>{title}</h2>
          <p>{copy}</p>
        </div>
      ))}
    </section>
  );
}

function CallSection() {
  const { phase, open, close, ask } = useTavusCall();
  return (
    <>
      <Hero phase={phase} onOpen={open} />
      {isElementMounted(phase) && (
        <CallDialog phase={phase} onClose={close} onAsk={ask} />
      )}
      <Features />
    </>
  );
}

function MissingDeployment() {
  return (
    <section className="hero">
      <h1>No deployment id.</h1>
      <p className="lede">
        Paste your deployment id into <code>src/constants.ts</code>, then restart the dev server.
      </p>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer mono">
      <span>© {new Date().getFullYear()} Acme. A demo page for the Tavus embed.</span>
      <a href="https://docs.tavus.io/sections/deployments/host-communication">
        Host communication docs
      </a>
    </footer>
  );
}

export function App() {
  return (
    <>
      <Nav />
      <main id="top">
        {DEPLOYMENT_ID ? <CallSection /> : <MissingDeployment />}
        <PromptSection
          eyebrow="Build this"
          title="Open the call from your own button"
          intro="Copy the prompt into your coding agent. It covers mounting the element on demand, waiting for tavus:ready, starting the call, and tearing it down."
          variants={PROMPT_VARIANTS}
        />
      </main>
      <Footer />
    </>
  );
}
