/** Everything the page shows is derived from this one value. */
export type CallPhase =
  | { kind: "idle" }
  | { kind: "opening" }
  | { kind: "starting" }
  | { kind: "live"; conversationId: string; startedAt: number }
  | { kind: "ended"; durationMs: number }
  | { kind: "error"; message: string };

/** The element exists in the DOM only while a call is opening, running or just ended. */
export function isElementMounted(phase: CallPhase): boolean {
  return phase.kind !== "idle";
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
