import { useState } from "react";

export interface PromptVariant {
  id: string;
  label: string;
  text: string;
}

interface PromptSectionProps {
  eyebrow: string;
  title: string;
  intro: string;
  variants: PromptVariant[];
}

/** "Copy this prompt" block: one tab per target (existing project, new project). */
export function PromptSection({ eyebrow, title, intro, variants }: PromptSectionProps) {
  const [activeId, setActiveId] = useState(variants[0].id);
  const [copied, setCopied] = useState(false);
  const active = variants.find((variant) => variant.id === activeId) ?? variants[0];

  async function copy() {
    await navigator.clipboard.writeText(active.text);
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
          <div className="prompt-tabs" role="tablist">
            {variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                role="tab"
                aria-selected={variant.id === active.id}
                onClick={() => {
                  setActiveId(variant.id);
                  setCopied(false);
                }}
              >
                {variant.label}
              </button>
            ))}
          </div>
          <button type="button" className="copy" onClick={copy} aria-live="polite">
            {copied ? "Copied" : "Copy prompt"}
          </button>
        </div>
        <pre>{active.text}</pre>
      </div>
    </section>
  );
}
