import { useEffect, useState } from "react";
import { TavusIntegration } from "@tavus/embed";
import { RESET_AFTER_CALL_MS } from "./constants.ts";

/** attract → in-call → wrapping-up → (element recreated) → attract */
export type KioskPhase = "loading" | "attract" | "in-call" | "wrapping-up";

/**
 * Owns the kiosk loop. The element's own preview button starts the call, so
 * the page only listens. `session` changes whenever the element should be
 * recreated; the caller uses it as the React key on the element's wrapper.
 */
export function useKioskSession() {
  const [session, setSession] = useState(0);
  const [phase, setPhase] = useState<KioskPhase>("loading");

  useEffect(() => {
    const tavus = new TavusIntegration("tavus-embed");
    const onReady = () => setPhase("attract");
    const onStarted = () => setPhase("in-call");
    // Only a call this element ran can end; anything else is noise.
    const onEnded = () => setPhase((current) => (current === "in-call" ? "wrapping-up" : current));
    tavus.on("tavus:ready", onReady);
    tavus.on("tavus:conversation-started", onStarted);
    tavus.on("tavus:conversation-ended", onEnded);
    tavus.on("tavus:error", onEnded);
    return () => {
      tavus.off("tavus:ready", onReady);
      tavus.off("tavus:conversation-started", onStarted);
      tavus.off("tavus:conversation-ended", onEnded);
      tavus.off("tavus:error", onEnded);
    };
  }, [session]);

  useEffect(() => {
    if (phase !== "wrapping-up") return;
    const timer = setTimeout(() => {
      setSession((current) => current + 1);
      setPhase("loading");
    }, RESET_AFTER_CALL_MS);
    return () => clearTimeout(timer);
  }, [phase]);

  return { session, phase };
}
