import { useCallback, useEffect, useRef, useState } from "react";
import { TavusIntegration } from "@tavus/embed";
import { readUtterance, type Screen, type Utterance } from "./session.ts";
import { WARM_ROOM_WHILE_TYPING } from "./constants.ts";

/**
 * The element is mounted (hidden) from page load, so `tavus:ready` has long
 * fired by the time the visitor submits their name and the start call happens
 * from their click. `session` is the React key on the element's wrapper;
 * bumping it after a summary recreates the element for the next session.
 */
export function useSession() {
  const [session, setSession] = useState(0);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>({ kind: "intro" });
  const [transcript, setTranscript] = useState<Utterance[]>([]);
  const integrationRef = useRef<TavusIntegration | null>(null);
  const warmedRef = useRef<string | null>(null);

  useEffect(() => {
    const tavus = new TavusIntegration("tavus-embed");
    integrationRef.current = tavus;
    const onReady = () => setReady(true);
    const onStarted = () =>
      setScreen((current) =>
        current.kind === "call" ? { ...current, startedAt: Date.now() } : current,
      );
    const onEnded = () =>
      setScreen((current) =>
        current.kind === "call"
          ? {
              kind: "summary",
              firstName: current.firstName,
              durationMs: current.startedAt ? Date.now() - current.startedAt : 0,
            }
          : current,
      );
    const onProtocol = (event: CustomEvent<unknown>) => {
      const line = readUtterance(event.detail);
      if (line) setTranscript((lines) => [...lines, line]);
    };
    tavus.on("tavus:ready", onReady);
    tavus.on("tavus:conversation-started", onStarted);
    tavus.on("tavus:conversation-ended", onEnded);
    tavus.on("tavus:error", onEnded);
    tavus.on("tavus:protocol-message", onProtocol);
    return () => {
      tavus.off("tavus:ready", onReady);
      tavus.off("tavus:conversation-started", onStarted);
      tavus.off("tavus:conversation-ended", onEnded);
      tavus.off("tavus:error", onEnded);
      tavus.off("tavus:protocol-message", onProtocol);
    };
  }, [session]);

  // One room per visit: created once the visitor pauses on a plausible name.
  // The greeting and context are read at creation, so if the name changes
  // before Start, Start creates the room again instead of joining the warm one.
  const warmUp = useCallback(
    (firstName: string) => {
      if (!WARM_ROOM_WHILE_TYPING || !ready || firstName.length < 2 || warmedRef.current !== null) {
        return;
      }
      warmedRef.current = firstName;
      void integrationRef.current?.createConversation().catch(() => {
        warmedRef.current = null;
      });
    },
    [ready],
  );

  const start = useCallback((firstName: string) => {
    setScreen({ kind: "call", firstName, startedAt: null });
    const tavus = integrationRef.current;
    if (!tavus) return;
    if (warmedRef.current !== null && warmedRef.current !== firstName) {
      warmedRef.current = firstName;
      void tavus.createConversation().finally(() => tavus.startConversation());
      return;
    }
    tavus.startConversation();
  }, []);

  const end = useCallback(() => {
    integrationRef.current?.endConversation();
  }, []);

  const reset = useCallback(() => {
    setTranscript([]);
    setReady(false);
    warmedRef.current = null;
    setScreen({ kind: "intro" });
    setSession((current) => current + 1);
  }, []);

  return { session, ready, screen, transcript, warmUp, start, end, reset };
}
