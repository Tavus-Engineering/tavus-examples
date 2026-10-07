import { useState } from "react";
import { PromptSection } from "./components/PromptSection.tsx";
import { PROMPT } from "./prompt.ts";
import { AGENT_NAME, DEPLOYMENT_ID, OVERRIDE_CONFIG, RESET_AFTER_CALL_MS } from "./constants.ts";
import { useKioskSession, type KioskPhase } from "./use-kiosk-session.ts";

const STATUS: Record<KioskPhase, string> = {
  loading: "Loading",
  attract: "Ready for the next visitor",
  "in-call": "In a call",
  "wrapping-up": `Resetting in ${RESET_AFTER_CALL_MS / 1000}s`,
};

function Totem() {
  const { session, phase } = useKioskSession();
  return (
    <section className="totem" data-phase={phase}>
      <header className="totem-top">
        <span className="brand">Acme</span>
        <span className="mono">Lorem ipsum · dolor sit</span>
      </header>

      <div className="card-frame">
        <div className="card" key={session}>
          <tavus-embed
            deployment-id={DEPLOYMENT_ID}
            override-config={OVERRIDE_CONFIG}
          />
        </div>
        <div className="greeting">
          <h1>Hi, I&apos;m {AGENT_NAME}.</h1>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
      </div>

      <footer className="totem-bottom mono">
        <span className="status" data-phase={phase}>
          <span className="dot" />
          {STATUS[phase]}
        </span>
        <span>Lorem ipsum</span>
      </footer>
    </section>
  );
}

function MissingDeployment() {
  return (
    <section className="totem missing">
      <p>
        Paste your deployment id into <code>src/constants.ts</code>, then restart the dev server.
      </p>
    </section>
  );
}

function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  async function toggle() {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      setIsFullscreen(false);
    } else {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    }
  }
  return (
    <button type="button" className="chrome-btn" onClick={toggle}>
      {isFullscreen ? "Exit fullscreen" : "Fullscreen"}
    </button>
  );
}

function BuildThisDrawer() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="chrome-btn" onClick={() => setOpen(true)}>
        Build this
      </button>
      {open && (
        <div className="drawer" role="dialog" aria-label="Build this">
          <button type="button" className="chrome-btn drawer-close" onClick={() => setOpen(false)}>
            Close
          </button>
          <PromptSection
            eyebrow="Build this"
            title="Run the same totem on your screen"
            intro="Copy this prompt into your coding agent (Cursor, Claude Code, Lovable, Replit). It asks what you want to build, explains what the element can do, and points at the docs and these examples. Say you want to start from the embed-unattended-screen example."
            text={PROMPT}
          />
        </div>
      )}
    </>
  );
}

export function App() {
  return (
    <main className="kiosk">
      {DEPLOYMENT_ID ? <Totem /> : <MissingDeployment />}
      <div className="chrome">
        <FullscreenButton />
        <BuildThisDrawer />
      </div>
    </main>
  );
}
