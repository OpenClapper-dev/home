/**
 * openclapper.org: what the project is, where it comes from, the three apps, the state of support,
 * the hosted version and why it is closed, then the two forms. The sections in the owner's voice are
 * marked (.voice); the rest speaks for the product.
 */
import { Button, IconButton, LinkButton, Modal, THEME_CYCLE, THEME_ICON, THEME_LABEL, useTheme } from "@openclapper/home-ui";
import { useEffect, useState } from "preact/hooks";
import { Requests } from "./Requests.tsx";
import { Waitlist } from "./Waitlist.tsx";

const CORE = "https://github.com/OpenClapper-dev/core";

/** The confirmation link lands on /?confirmed=yes|no#waitlist; the state is read once and the URL cleaned. */
function useConfirmed(): "yes" | "no" | null {
  const [state] = useState<"yes" | "no" | null>(() => {
    const v = new URLSearchParams(location.search).get("confirmed");
    return v === "yes" || v === "no" ? v : null;
  });
  useEffect(() => { if (state) history.replaceState(null, "", `${location.pathname}${location.hash}`); }, []);
  return state;
}

export function Page() {
  const [theme, setTheme] = useTheme();
  const confirmed = useConfirmed();
  const [why, setWhy] = useState(false);
  return (
    <main class="page">
      <header class="top">
        <a class="top__brand" href="/"><img src="/icons/favicon.svg" alt="" width="24" height="24" />OpenClapper</a>
        <nav class="top__nav" aria-label="Page">
          <a class="top__link" href="#apps">The apps</a>
          <a class="top__link" href="#support">Support</a>
          <a class="top__link" href="#ideas">Ideas</a>
          <a class="top__link" href="#waitlist">Waiting list</a>
          <a href={CORE} rel="noopener">GitHub</a>
          <IconButton icon={THEME_ICON[theme]} label={THEME_LABEL[theme]} onClick={() => setTheme(THEME_CYCLE[theme])} />
        </nav>
      </header>

      <section class="hero">
        <span class="hero__status">Early alpha · self-hosted · open source</span>
        <h1>Tooling for film prep and production, built by someone who did the job.</h1>
        <p class="lede">OpenClapper organises a production from the first idea to the last shooting day, keeps the crew in sync, and runs on infrastructure you own. Open source under Apache 2.0.</p>
        <div class="hero__cta">
          <LinkButton href="#waitlist" size="lg" icon="arrow-down">Join the tester waiting list</LinkButton>
          <LinkButton href="#ideas" size="lg" kind="secondary">Send an idea</LinkButton>
          <LinkButton href={CORE} size="lg" kind="ghost" icon="github" rel="noopener">Source</LinkButton>
        </div>
      </section>

      <section class="sec" id="origin">
        <h2>Where it comes from</h2>
        <p class="sec__sub">A production tool from the production office.</p>
        <div class="prose voice">
          <p>I worked as a 1. Aufnahmeleiter, roughly a 2nd AD in the American system, through prep and production on smaller independent projects. I know first-hand how poor the tooling is for organising a production and keeping everybody in sync: spreadsheets, group chats, PDFs that are outdated by the time they are printed.</p>
          <p>I left the industry and became a full-time developer. The moment I started shooting my own hobby projects, the need for a tool to organise the shooting process came straight back. OpenClapper is my answer to it.</p>
          <p>Rather than sink time and money into a niche tool only I use, I am committed to building a real open-source solution for organising prep and production.</p>
        </div>
      </section>

      <section class="sec" id="for">
        <h2>Who it is for</h2>
        <p class="sec__sub">Small crews first. Whole productions eventually. Your own infrastructure always.</p>
        <div class="prose">
          <p>The first users are small independent crews and solo filmmakers. The aim beyond that is to cover prep and production end to end, for larger productions too.</p>
          <p>Anyone can self-host the whole ecosystem: a film school, a small production company, a one-person crew. Your data stays yours, and the running costs stay small.</p>
          <p>There is no lock-in. An export of all your data from your own instance is planned, and if you ever want to move to or from another tool, I will do my best to help with the migration.</p>
        </div>
      </section>

      <section class="sec" id="apps">
        <h2>The ecosystem</h2>
        <p class="sec__sub">Three apps, one system.</p>
        <p class="prose">Features are deliberately not listed here: the project is in alpha, many of them are shaped by one cinematographer’s workflow, and they will change and merge as more people use it. A detailed list of supported workflows comes once OpenClapper leaves alpha.</p>
        <div class="apps">
          <article class="card">
            <img class="card__icon" src="/icons/studio.svg" alt="" width="64" height="64" />
            <span class="card__tag">Web</span>
            <h3>Studio</h3>
            <p>The main web application, where the work is done: organising and planning a production.</p>
          </article>
          <article class="card">
            <img class="card__icon" src="/icons/phone.svg" alt="" width="64" height="64" />
            <span class="card__tag">Phone</span>
            <h3>Mobile</h3>
            <p>A lightweight companion that helps you stay on track, closely integrated with the Studio.</p>
          </article>
          <article class="card">
            <img class="card__icon" src="/icons/admin.svg" alt="" width="64" height="64" />
            <span class="card__tag">Self-hosting</span>
            <h3>Admin</h3>
            <p>The operator's side of an instance: user management and resource management for whoever runs OpenClapper for a school, a company or a crew.</p>
          </article>
        </div>
      </section>

      <section class="sec" id="support">
        <h2>State of support</h2>
        <p class="sec__sub">What runs where today.</p>
        <div class="apps">
          <article class="card">
            <span class="card__tag">Studio and Admin</span>
            <h3>Chrome and Chromium browsers</h3>
            <p>Strongly recommended. Other browsers may work, but they are untested.</p>
          </article>
          <article class="card">
            <span class="card__tag">Mobile</span>
            <h3>Android</h3>
            <p>An iOS app is planned. The ecosystem is meant to stay cross-platform.</p>
            <span class="pill pill--soon">iOS planned</span>
          </article>
          <article class="card">
            <span class="card__tag">Self-hosting</span>
            <h3>Cloudflare and GitHub</h3>
            <p>A deployment runs on a Cloudflare account and is managed from a GitHub repository.</p>
            <div><Button kind="secondary" size="sm" onClick={() => setWhy(true)}>Why these services?</Button></div>
          </article>
        </div>
        <Modal open={why} onClose={() => setWhy(false)} title="Why Cloudflare and GitHub?">
          <p>Self-hosting should cost a small company, a film school or an independent crew nothing to start, and as little as possible to run. Both services make that true today.</p>
          <h3>GitHub</h3>
          <p>A very generous free tier for managing a deployment: a self-hoster does not pay for it. And it is the de-facto standard of the open-source community, where OpenClapper lives anyway.</p>
          <h3>Cloudflare</h3>
          <p>The most comprehensive set of cloud services for what OpenClapper needs, in one account: compute, a database, file storage, mail, access control. The free tier covers compute, so starting costs nothing.</p>
          <p>File storage is where a production tool spends its money, and Cloudflare’s pricing for it is by far the cheapest among the cloud providers. Zero Trust adds tight access policies for the admin side at no extra cost.</p>
          <h3>Both</h3>
          <p>Both have very strong support in LLM coding agents, which makes setting up a self-hosted instance comparatively easy, even without a developer on the team.</p>
        </Modal>
      </section>

      <section class="sec" id="hosted">
        <h2>The hosted version</h2>
        <p class="sec__sub">There is one. It is closed for now.</p>
        <div class="prose voice">
          <p>I run a hosted OpenClapper for myself, and I am opening it to selected testers only. The reason is cost, plainly: compute at this scale is cheap, but file storage in the cloud is not, and OpenClapper relies on files of all kinds to keep you inside the ecosystem.</p>
          <p>I do not rule out a version everyone can use without self-hosting; quite the opposite, I aim for it. But until I can estimate what running it costs at scale, the hosted version stays closed. If you want to help find out, join the waiting list below.</p>
        </div>
      </section>

      <section class="sec" id="ideas">
        <h2>Contribute</h2>
        <p class="sec__sub">Send ideas. Any department, any problem.</p>
        <div class="prose voice">
          <p>In the age of AI, most features I can implement myself. What I cannot conjure is your hands-on experience. I am hugely thankful to anyone who takes the time to write down what gets in their way on a shoot.</p>
          <p>It does not have to be well written. Brainstorms, half-thoughts, a list of annoyances: anything goes. I sort it out, with AI's help, and make sense of it. If you would like to test the feature once it exists, or be asked questions while it is taking shape, say so and tell me how to reach you, in whatever way you are comfortable with.</p>
        </div>
        <Requests />
      </section>

      <section class="sec" id="waitlist">
        <h2>Tester waiting list</h2>
        <p class="sec__sub">Try the hosted version before anyone else.</p>
        <p class="prose">Leave your email and I will invite you when there is a spot. Everything else is optional; it helps me pick a varied group of testers.</p>
        <Waitlist confirmed={confirmed} />
      </section>

      <footer class="foot">
        <span>© 2026 OpenClapper · Apache 2.0</span>
        <a href={CORE} rel="noopener">GitHub</a>
        <a href="/privacy">Privacy</a>
        <span class="num">v{__HOME_VERSION__} ({__HOME_COMMIT__})</span>
      </footer>
    </main>
  );
}
