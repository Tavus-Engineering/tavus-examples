import { useState } from "react";
import { PromptSection } from "./components/PromptSection.tsx";
import { PROMPT_VARIANTS } from "./prompt.ts";
import { DEPLOYMENT_ID, EXPAND_OPTIONS, OVERRIDE_CONFIG } from "./constants.ts";

const SPECS = [
  ["Lorem", "Ipsum dolor"],
  ["Sit amet", "Consectetur"],
  ["Adipiscing", "Elit sed"],
  ["Eiusmod", "Tempor"],
  ["Incididunt", "Ut labore"],
  ["Dolore", "Magna aliqua"],
];

const REVIEWS = [
  ["Lorem I.", "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore."],
  ["Ipsum D.", "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris."],
  ["Dolor S.", "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum."],
];

const COLORS = [
  { name: "Lorem", hex: "#e6e6e0" },
  { name: "Ipsum", hex: "#8a8d94" },
  { name: "Dolor", hex: "#3a3d44" },
];

function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        ACME
      </a>
      <nav>
        <a href="#specs">Specs</a>
        <a href="#reviews">Reviews</a>
        <a href="#build-this">Build this</a>
      </nav>
      <span className="mono">Lorem ipsum · dolor sit amet</span>
    </header>
  );
}

function SpecialistEmbed() {
  if (!DEPLOYMENT_ID) {
    return (
      <div className="embed-missing mono">
        Paste your deployment id into src/constants.ts, then restart the dev server.
      </div>
    );
  }
  return (
    <div className="embed-card">
      <tavus-embed
        deployment-id={DEPLOYMENT_ID}
        expand-options={EXPAND_OPTIONS}
        override-config={OVERRIDE_CONFIG}
      />
    </div>
  );
}

function HeroCopy() {
  const [color, setColor] = useState(COLORS[0]);
  return (
    <div className="hero-copy">
      <p className="mono kicker">Lorem ipsum · 2026</p>
      <h1>Lorem ipsum dolor</h1>
      <p className="lede">
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation.
      </p>
      <div className="swatches">
        {COLORS.map((option) => (
          <button
            key={option.name}
            type="button"
            className="swatch"
            aria-pressed={option.name === color.name}
            style={{ background: option.hex }}
            onClick={() => setColor(option)}
          >
            <span className="sr-only">{option.name}</span>
          </button>
        ))}
        <span className="mono">{color.name}</span>
      </div>
      <button type="button" className="cta">
        Add to cart
      </button>
    </div>
  );
}

function Specialist() {
  return (
    <aside className="specialist">
      <div className="specialist-head">
        <span className="live-dot" />
        <span className="mono">Ask a specialist</span>
      </div>
      <div className="embed-slot">
        <SpecialistEmbed />
      </div>
      <p className="specialist-note">Ask anything about this product. Live, right now.</p>
    </aside>
  );
}

function Specs() {
  return (
    <section className="specs" id="specs">
      {SPECS.map(([label, value]) => (
        <div key={label}>
          <span className="mono">{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </section>
  );
}

function Reviews() {
  return (
    <section className="reviews" id="reviews">
      {REVIEWS.map(([name, quote]) => (
        <figure key={name}>
          <span className="mono stars">★★★★★</span>
          <blockquote>{quote}</blockquote>
          <figcaption className="mono">{name}</figcaption>
        </figure>
      ))}
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer mono">
      <span>© {new Date().getFullYear()} Acme. A demo page for the Tavus embed.</span>
      <a href="https://docs.tavus.io/sections/deployments/embed">Embed documentation</a>
    </footer>
  );
}

export function App() {
  return (
    <>
      <Nav />
      <main id="top">
        <section className="hero">
          <HeroCopy />
          <Specialist />
        </section>
        <Specs />
        <Reviews />
        <PromptSection
          eyebrow="Build this"
          title="Add the same card to your product page"
          intro="Copy the prompt into your coding agent. It explains the card size, the expand-options keys and why the element, not your code, owns the modal."
          variants={PROMPT_VARIANTS}
        />
      </main>
      <Footer />
    </>
  );
}
