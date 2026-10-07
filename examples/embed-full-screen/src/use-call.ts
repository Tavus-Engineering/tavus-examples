import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { TavusIntegration } from "@tavus/embed";

export interface Intake {
  firstName: string;
  topic: string;
}

const intakeKey = (intake: Intake) => `${intake.firstName}|${intake.topic}`;

/**
 * One element lives for the whole app, hidden on the intake and done pages
 * and full-screen on the call page, so the room can be created while the
 * visitor is still filling in the form and joined the moment they continue.
 * `session` is the React key on the element's wrapper; bumping it after a
 * finished session recreates the element for the next visitor.
 */
export function useCall() {
  const navigate = useNavigate();
  const [session, setSession] = useState(0);
  const [readySession, setReadySession] = useState(-1);
  const [durationMs, setDurationMs] = useState(0);
  const ready = readySession === session;
  const integrationRef = useRef<TavusIntegration | null>(null);
  const warmedRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    const tavus = new TavusIntegration("tavus-embed");
    integrationRef.current = tavus;
    warmedRef.current = null;
    const onReady = () => setReadySession(session);
    const onStarted = () => {
      startedAtRef.current = Date.now();
    };
    // Back on the call page ends the conversation and leaves first, so an
    // ended event that arrives on another route is that cancellation, not a
    // finished call.
    const onEnded = () => {
      if (window.location.pathname !== "/call") return;
      setDurationMs(startedAtRef.current ? Date.now() - startedAtRef.current : 0);
      navigate("/next-steps");
    };
    tavus.on("tavus:ready", onReady);
    tavus.on("tavus:conversation-started", onStarted);
    tavus.on("tavus:conversation-ended", onEnded);
    return () => {
      tavus.off("tavus:ready", onReady);
      tavus.off("tavus:conversation-started", onStarted);
      tavus.off("tavus:conversation-ended", onEnded);
    };
  }, [session, navigate]);

  // Creates the room once the form holds a plausible answer, so the start on
  // Continue joins a warm conversation. Every creation is a real conversation;
  // a changed answer re-creates at Continue time instead of on every keystroke.
  const warmUp = useCallback(
    (intake: Intake) => {
      if (!ready || intake.firstName.length < 2 || warmedRef.current !== null) return;
      warmedRef.current = intakeKey(intake);
      integrationRef.current?.createConversation().catch(() => {
        warmedRef.current = null;
      });
    },
    [ready],
  );

  const start = useCallback((intake: Intake) => {
    const tavus = integrationRef.current;
    if (!tavus) return;
    if (warmedRef.current === intakeKey(intake)) {
      tavus.startConversation();
    } else {
      warmedRef.current = intakeKey(intake);
      tavus.createConversation().finally(() => tavus.startConversation());
    }
  }, []);

  // Leaving the call page before or during the call. Ends the live call or the
  // room that was created for it, so nothing is left running unattended.
  const abandon = useCallback(() => {
    integrationRef.current?.endConversation();
    warmedRef.current = null;
  }, []);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    setDurationMs(0);
    setSession((current) => current + 1);
  }, []);

  return { session, ready, durationMs, warmUp, start, abandon, reset };
}
