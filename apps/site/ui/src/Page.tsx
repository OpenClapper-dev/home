/**
 * openclapper.org: the goal, why the owner does this, where the project stands, what open source means here, the plan to the alpha, the invitation to
 * contribute, then the two forms. Every string comes from copy.ts. One centred axis: a slim sticky bar,
 * the headline, then the chapters as alternating full-width bands with a numbered centred title and a
 * 660px reading column (design chosen in issue #2). The sections in the owner's voice are cards.
 */
import { IconButton, LinkButton, THEME_CYCLE, THEME_ICON, THEME_LABEL, useTheme } from "@openclapper/home-ui";
import { useEffect, useState } from "preact/hooks";
import { t } from "./copy.ts";
import { Requests } from "./Requests.tsx";
import { Waitlist } from "./Waitlist.tsx";

export const CORE = "https://github.com/OpenClapper-dev/core";

/** The confirmation link lands on /?confirmed=yes|no#waitlist; the state is read once and the URL cleaned. */
function useConfirmed(): "yes" | "no" | null {
  const [state] = useState<"yes" | "no" | null>(() => {
    const v = new URLSearchParams(location.search).get("confirmed");
    return v === "yes" || v === "no" ? v : null;
  });
  useEffect(() => { if (state) history.replaceState(null, "", `${location.pathname}${location.hash}`); }, []);
  return state;
}

/** The theme button, which every page's bar carries. */
export function Controls() {
  const [theme, setTheme] = useTheme();
  return <IconButton icon={THEME_ICON[theme]} label={THEME_LABEL[theme]} onClick={() => setTheme(THEME_CYCLE[theme])} />;
}

/** The sticky bar: brand, the page's anchors (hidden on phones) and the controls. */
export function Top({ children }: { children?: preact.ComponentChildren }) {
  return (
    <header class="top">
      <a class="top__brand" href="/"><img src="/icons/favicon.svg" alt="" width="22" height="22" />OpenClapper</a>
      {children}
      <div class="top__ctl"><Controls /></div>
    </header>
  );
}

const Voice = ({ p }: { p: string[] }) => <div class="voice">{p.map((s) => <p key={s}>{s}</p>)}</div>;
const nn = (i: number) => String(i).padStart(2, "0");

function Band({ id, n, h, sub, children }: { id: string; n: number; h: string; sub: string; children: preact.ComponentChildren }) {
  return (
    <section class="band" id={id}>
      <div class="col">
        <div class="band__head">
          <span class="band__n num" aria-hidden="true">{nn(n)}</span>
          <h2>{h}</h2>
          <p class="band__sub">{sub}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export function Page() {
  const confirmed = useConfirmed();
  return (
    <>
      <Top>
        <nav class="top__nav" aria-label="Page">
          <a href="#goal">{t.nav.goal}</a>
          <a href="#why">{t.nav.why}</a>
          <a href="#state">{t.nav.state}</a>
          <a href="#rug">{t.nav.rug}</a>
          <a href="#plan">{t.nav.plan}</a>
          <a href="#ideas">{t.nav.ideas}</a>
          <a href="#waitlist">{t.nav.waitlist}</a>
          <a href={CORE} rel="noopener">GitHub</a>
        </nav>
      </Top>

      <main>
        <section class="hero">
          <span class="hero__status">{t.hero.status}</span>
          <h1>{t.hero.title}</h1>
          <p class="lede">{t.hero.lede}</p>
          <div class="hero__cta">
            <LinkButton href="#ideas" size="lg" icon="arrow-down">{t.hero.idea}</LinkButton>
            <LinkButton href="#waitlist" size="lg" kind="secondary">{t.hero.join}</LinkButton>
            <LinkButton href={CORE} size="lg" kind="ghost" icon="github" rel="noopener">{t.hero.source}</LinkButton>
          </div>
        </section>

        <Band id="goal" n={1} h={t.goal.h} sub={t.goal.sub}><div class="prose">{t.goal.p.map((s) => <p key={s}>{s}</p>)}</div></Band>
        <Band id="why" n={2} h={t.why.h} sub={t.why.sub}><Voice p={t.why.p} /></Band>
        <Band id="state" n={3} h={t.state.h} sub={t.state.sub}><Voice p={t.state.p} /></Band>

        <Band id="rug" n={4} h={t.rug.h} sub={t.rug.sub}>
          <div class="voice voice--parts">
            {t.rug.parts.map((part) => <div class="voice__part" key={part.h}><span class="voice__tag">{part.tag}</span><h3>{part.h}</h3>{part.p.map((s) => <p key={s}>{s}</p>)}</div>)}
          </div>
        </Band>

        <Band id="plan" n={5} h={t.plan.h} sub={t.plan.sub}>
          <ol class="steps">
            {t.plan.steps.map((s, i) => (
              <li class={i === 0 ? "step step--now" : "step"} key={s.h}>
                <span class="step__n num" aria-hidden="true">{i + 1}</span>
                <div class="step__text">
                  <h3>{s.h}{i === 0 && <span class="pill pill--ok step__now">{t.plan.now}</span>}</h3>
                  <p>{s.p}</p>
                </div>
              </li>
            ))}
          </ol>
          <aside class="ticker">
            <div class="ticker__text"><h3>{t.plan.ticker}</h3><p>{t.plan.tickerP}</p></div>
            <LinkButton href="#waitlist" kind="secondary" icon="arrow-down">{t.plan.tickerLink}</LinkButton>
          </aside>
        </Band>

        <Band id="ideas" n={6} h={t.ideas.h} sub={t.ideas.sub}>
          <Voice p={[...t.ideas.p, t.ideas.language]} />
          <Requests />
        </Band>

        <Band id="waitlist" n={7} h={t.waitlist.h} sub={t.waitlist.sub}>
          <p class="prose">{t.waitlist.p}</p>
          <Waitlist confirmed={confirmed} />
        </Band>
      </main>

      <footer class="foot">
        <span>{t.foot.license}</span>
        <a href={CORE} rel="noopener">GitHub</a>
        <a href="/privacy">{t.foot.privacy}</a>
        <span class="num">v{__HOME_VERSION__} ({__HOME_COMMIT__})</span>
      </footer>
    </>
  );
}
