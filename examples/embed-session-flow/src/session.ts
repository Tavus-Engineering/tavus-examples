export type Screen =
  | { kind: "intro" }
  | { kind: "call"; firstName: string; startedAt: number | null }
  | { kind: "summary"; firstName: string; durationMs: number };

export interface Utterance {
  role: "user" | "replica";
  speech: string;
}

/**
 * `tavus:protocol-message` carries the raw protocol payload as `detail`. The
 * element's own chat panel lists only complete utterances, and the transcript
 * follows the same rule. Streaming partials reach the host under the same
 * event_type but carry a boolean `final`; complete utterances never do.
 */
export function readUtterance(detail: unknown): Utterance | null {
  if (typeof detail !== "object" || detail === null) return null;
  const event = detail as { event_type?: unknown; properties?: unknown };
  if (event.event_type !== "conversation.utterance") return null;
  const props = event.properties as
    | { role?: unknown; speech?: unknown; final?: unknown }
    | undefined;
  if (!props || typeof props.speech !== "string") return null;
  if (typeof props.final === "boolean") return null;
  if (props.role !== "user" && props.role !== "replica") return null;
  return { role: props.role, speech: props.speech };
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function transcriptAsText(firstName: string, lines: Utterance[]): string {
  return lines
    .map((line) => `${line.role === "user" ? firstName : "Agent"}: ${line.speech}`)
    .join("\n");
}
