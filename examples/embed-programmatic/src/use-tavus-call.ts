import { useCallback, useEffect, useRef, useState } from "react";
import { TavusIntegration } from "@tavus/embed";
import { isElementMounted, type CallPhase } from "./call-phase.ts";

/**
 * Nothing Tavus-related exists on the page until `open()`. The caller mounts
 * <tavus-embed> while `isElementMounted(phase)` is true; this hook then finds
 * it through `TavusIntegration`, waits for `tavus:ready` and starts the call.
 * `close()` unmounts the element again, which also tears the call down.
 */
export function useTavusCall() {
  const [phase, setPhase] = useState<CallPhase>({ kind: "idle" });
  const integrationRef = useRef<TavusIntegration | null>(null);
  const mounted = isElementMounted(phase);

  useEffect(() => {
    if (!mounted) {
      integrationRef.current = null;
      return;
    }
    const integration = new TavusIntegration("tavus-embed");
    integrationRef.current = integration;

    const onReady = () => {
      setPhase({ kind: "starting" });
      integration.startConversation();
    };
    const onStarted = (event: CustomEvent<{ conversationId: string }>) => {
      setPhase({ kind: "live", conversationId: event.detail.conversationId, startedAt: Date.now() });
    };
    // Only a call this element ran can end; ignore anything else.
    const onEnded = () => {
      setPhase((current) => {
        if (current.kind === "live") {
          return { kind: "ended", durationMs: Date.now() - current.startedAt };
        }
        return current.kind === "starting" ? { kind: "ended", durationMs: 0 } : current;
      });
    };
    const onError = (event: CustomEvent<{ message: string }>) => {
      setPhase({ kind: "error", message: event.detail.message });
    };

    integration.on("tavus:ready", onReady);
    integration.on("tavus:conversation-started", onStarted);
    integration.on("tavus:conversation-ended", onEnded);
    integration.on("tavus:error", onError);
    return () => {
      integration.off("tavus:ready", onReady);
      integration.off("tavus:conversation-started", onStarted);
      integration.off("tavus:conversation-ended", onEnded);
      integration.off("tavus:error", onError);
    };
  }, [mounted]);

  const open = useCallback(() => {
    setPhase({ kind: "opening" });
  }, []);

  const close = useCallback(() => {
    setPhase({ kind: "idle" });
  }, []);

  const ask = useCallback((text: string) => {
    integrationRef.current?.sendMessage({
      event_type: "conversation.respond",
      properties: { text },
    });
  }, []);

  return { phase, open, close, ask };
}
