import { useState } from "react";

interface PromptSectionProps {
  eyebrow: string;
  title: string;
  intro: string;
  text: string;
}

/** "Copy this prompt" block. The text is the shared embed prompt from examples/embed-prompt.md. */
export function PromptSection({ eyebrow, title, intro, text }: PromptSectionProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <section className="prompt" id="build-this">
      <div className="prompt-head">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{intro}</p>
      </div>
      <div className="prompt-card">
        <div className="prompt-bar">
          <span className="prompt-source">examples/embed-prompt.md</span>
          <button type="button" className="copy" onClick={copy} aria-live="polite">
            {copied ? "Copied" : "Copy prompt"}
          </button>
        </div>
        <pre>{text}</pre>
      </div>
    </section>
  );
}
