/**
 * openclapper.org: what the project is, where it comes from, the three apps, the state of support,
 * the hosted version and why it is closed, then the two forms. The sections in the owner's voice are
 * marked (.voice); the rest speaks for the product.
 */
import { IconButton, LinkButton, THEME_CYCLE, THEME_ICON, THEME_LABEL, useTheme } from "@openclapper/home-ui";
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
  return (
    <main class="page">
      <header class="top">
        <a class="top__brand" href="/"><img src="/icons/favicon.svg" alt="" width="24" height="24" />OpenClapper</a>
        <nav class="top__nav" aria-label="Page">
          <a href="#apps">The apps</a>
          <a href="#support">Support</a>
          <a href="#ideas">Ideas</a>
          <a href="#waitlist">Waiting list</a>
          <a href={CORE} rel="noopener">GitHub</a>
          <IconButton icon={THEME_ICON[theme]} label={THEME_LABEL[theme]} onClick={() => setTheme(THEME_CYCLE[theme])} />
        </nav>
      </header>

      <section class="hero">
        <span class="hero__status">Early alpha · self-hosted · open source</span>
        <h1>Tooling for film prep and production, built by someone who did the job.</h1>
        <p class="lede">OpenClapper organises a shoot from scouting to the last shooting day, keeps the crew in sync, and runs on infrastructure you own. Open source under Apache 2.0.</p>
        <div class="hero__cta">
          <LinkButton href="#waitlist" size="lg" icon="arrow-down">Join the tester waiting list</LinkButton>
          <LinkButton href="#ideas" size="lg" kind="secondary">Send an idea</LinkButton>
          <LinkButton href={CORE} size="lg" kind="ghost" icon="github" rel="noopener">Source</LinkButton>
        </div>
      </section>

      <section class="sec" id="origin">
        <span class="sec__kicker">Where it comes from</span>
        <h2>A production tool from the production office.</h2>
        <div class="prose voice">
          <p>I worked as a 1. Aufnahmeleiter, roughly a 2nd AD in the American system, through prep and production on smaller independent projects. I know first-hand how poor the tooling is for organising a production and keeping everybody in sync: spreadsheets, group chats, PDFs that are outdated by the time they are printed.</p>
          <p>I left the industry and became a full-time developer. The moment I started shooting my own hobby projects, the need for a tool to organise the shooting process came straight back. OpenClapper is my answer to it.</p>
          <p>Rather than sink time and money into a niche tool only I use, I am committed to building a real open-source solution for organising prep and production.</p>
        </div>
      </section>

      <section class="sec" id="for">
        <span class="sec__kicker">Who it is for</span>
        <h2>Small crews first. Whole productions eventually. Your own infrastructure always.</h2>
        <div class="prose">
          <p>The first users are small independent crews and solo filmmakers. The aim beyond that is to cover prep and production end to end, for larger productions too.</p>
          <p>Anyone can self-host the whole ecosystem: a film school, a small production company, a one-person crew. Your data stays yours, and the running costs stay small.</p>
          <p>There is no lock-in. An export of all your data from your own instance is planned, and if you ever want to move to or from another tool, I will do my best to help with the migration.</p>
        </div>
      </section>

      <section class="sec" id="apps">
        <span class="sec__kicker">The ecosystem</span>
        <h2>Three apps, one system.</h2>
        <p class="prose">Features are deliberately not listed here: the project is in alpha, many of them are shaped by one cinematographer's workflow, and they will change and merge as more people use it. What stays is the division of labour.</p>
        <div class="apps">
          <article class="card">
            <span class="card__tag">Web</span>
            <h3>Studio</h3>
            <p>The primary application, where the work is done: reviewing and organising what was scouted, and planning the shooting days from it.</p>
          </article>
          <article class="card">
            <span class="card__tag">Phone</span>
            <h3>Mobile</h3>
            <p>A versatile companion on set and on location, closely integrated with the Studio: capture on the phone, and the Studio sees it.</p>
          </article>
          <article class="card">
            <span class="card__tag">Self-hosting</span>
            <h3>Admin</h3>
            <p>The operator's side of an instance: user management and resource management for whoever runs OpenClapper for a school, a company or a crew.</p>
          </article>
        </div>
      </section>

      <section class="sec" id="support">
        <span class="sec__kicker">State of support</span>
        <h2>What works today, and what is planned.</h2>
        <div class="support__wrap">
          <table class="support">
            <thead><tr><th scope="col">Area</th><th scope="col">Today</th><th scope="col">Planned</th></tr></thead>
            <tbody>
              <tr>
                <td>Studio and Admin</td>
                <td><span class="pill pill--ok">Chrome and Chromium browsers</span> Strongly recommended. Other browsers may work; there has not been time to test every one.</td>
                <td>Testing across browsers once the apps settle.</td>
              </tr>
              <tr>
                <td>Mobile</td>
                <td><span class="pill pill--ok">Android</span></td>
                <td><span class="pill pill--soon">iOS</span> Planned soon. The ecosystem is meant to stay cross-platform.</td>
              </tr>
              <tr>
                <td>Self-hosting</td>
                <td><span class="pill pill--ok">Cloudflare + GitHub</span> The deployment is tied to both today, and they will stay the recommended path.</td>
                <td><span class="pill pill--later">Your own infrastructure</span> A provider-independent layer underneath, or the Cloudflare stack on external hardware. Not the focus right now; it moves up when enough people ask for it.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="sec" id="hosted">
        <span class="sec__kicker">The hosted version</span>
        <h2>There is one. It is closed for now.</h2>
        <div class="prose voice">
          <p>I run a hosted OpenClapper for myself, and I am opening it to selected testers only. The reason is cost, plainly: compute at this scale is cheap, but file storage in the cloud is not, and OpenClapper relies on files of all kinds to keep you inside the ecosystem.</p>
          <p>I do not rule out a version everyone can use without self-hosting; quite the opposite, I aim for it. But until I can estimate what running it costs at scale, the hosted version stays closed. If you want to help find out, join the waiting list below.</p>
        </div>
      </section>

      <section class="sec" id="ideas">
        <span class="sec__kicker">Contribute</span>
        <h2>Send ideas. Any department, any problem.</h2>
        <div class="prose voice">
          <p>In the age of AI, most features I can implement myself. What I cannot conjure is your hands-on experience. I am hugely thankful to anyone who takes the time to write down what gets in their way on a shoot.</p>
          <p>It does not have to be well written. Brainstorms, half-thoughts, a list of annoyances: anything goes. I sort it out, with AI's help, and make sense of it. If you would like to test the feature once it exists, or be asked questions while it is taking shape, say so and tell me how to reach you, in whatever way you are comfortable with.</p>
        </div>
        <Requests />
      </section>

      <section class="sec" id="waitlist">
        <span class="sec__kicker">Tester waiting list</span>
        <h2>Try the hosted version before anyone else.</h2>
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
