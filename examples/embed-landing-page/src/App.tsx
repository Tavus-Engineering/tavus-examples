import { PromptSection } from "./components/PromptSection.tsx";
import { PROMPT_VARIANTS } from "./prompt.ts";
import { DEPLOYMENT_ID, OVERRIDE_CONFIG } from "./constants.ts";

const NAV_LINKS = ["Lorem", "Ipsum", "Dolor", "Sit amet"];

const SERVICES = [
  {
    index: "01",
    title: "Lorem ipsum dolor",
    body: "Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  },
  {
    index: "02",
    title: "Ut enim ad minim",
    body: "Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    index: "03",
    title: "Duis aute irure",
    body: "In reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  },
];

function Nav() {
  return (
    <header className="nav">
      <a className="brand" href="#top">
        <span className="brand-mark" />
        Acme
      </a>
      <nav>
        {NAV_LINKS.map((link) => (
          <a key={link} href="#concierge">
            {link}
          </a>
        ))}
      </nav>
      <a className="btn btn-outline" href="#concierge">
        Talk to the agent
      </a>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <p className="eyebrow">Lorem ipsum · dolor sit</p>
      <h1>
        Lorem ipsum dolor sit amet,
        <br />
        <em>consectetur adipiscing elit.</em>
      </h1>
      <p className="lede">
        Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      </p>
      <div className="hero-actions">
        <a className="btn btn-solid" href="#concierge">
          Talk to the agent
        </a>
        <a className="btn btn-text" href="#build-this">
          Built with Tavus, see how ↓
        </a>
      </div>
    </section>
  );
}

function ConciergeEmbed() {
  if (!DEPLOYMENT_ID) {
    return (
      <div className="embed-missing">
        <strong>No deployment id.</strong> Paste your deployment id into <code>src/constants.ts</code>, then restart the dev server.
      </div>
    );
  }
  return <tavus-embed deployment-id={DEPLOYMENT_ID} override-config={OVERRIDE_CONFIG} />;
}

function Concierge() {
  return (
    <section className="concierge" id="concierge">
      <div className="concierge-copy">
        <div>
          <p className="eyebrow">Live agent</p>
          <h2>Talk to our agent</h2>
        </div>
        <p>
          Press Start, allow the camera, and ask anything. The whole call runs inside this frame,
          on the page.
        </p>
      </div>
      <div className="embed-frame">
        <ConciergeEmbed />
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="services">
      {SERVICES.map((service) => (
        <article key={service.index}>
          <span className="index">{service.index}</span>
          <h3>{service.title}</h3>
          <p>{service.body}</p>
        </article>
      ))}
    </section>
  );
}

function Quote() {
  return (
    <section className="quote">
      <blockquote>
        “Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
        ut labore et dolore magna aliqua.”
      </blockquote>
      <cite>Lorem Ipsum, dolor sit amet</cite>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Acme. A demo page for the Tavus embed.</span>
      <a href="https://docs.tavus.io/sections/deployments/embed">Embed documentation</a>
    </footer>
  );
}

export function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Concierge />
        <Services />
        <Quote />
        <PromptSection
          eyebrow="Build this"
          title="Put the same agent on your site"
          intro="Copy the prompt into your coding agent. It contains everything the agent needs: the package, the element, the sizing rule and where the deployment id comes from."
          variants={PROMPT_VARIANTS}
        />
      </main>
      <Footer />
    </>
  );
}
