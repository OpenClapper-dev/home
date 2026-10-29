/**
 * openclapper.org: what the project is, where it comes from, who it is for, the three apps, flexibility,
 * the state of support, alpha, the maintainer, the hosted version, the plan ahead, then the two forms.
 * Every string comes from copy.ts. One centred axis: a slim sticky bar, the headline with the three app icons as its
 * picture, then the chapters as alternating full-width bands with a numbered centred title and a 660px
 * reading column (design chosen in issue #2). The sections in the owner's voice are cards.
 */
import { Button, IconButton, LinkButton, Modal, THEME_CYCLE, THEME_ICON, THEME_LABEL, useTheme } from "@openclapper/home-ui";
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
  return (
    <>
      <IconButton icon={THEME_ICON[theme]} label={THEME_LABEL[theme]} onClick={() => setTheme(THEME_CYCLE[theme])} />
    </>
  );
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

function Band({ id, n, h, sub, wide, children }: { id: string; n: number; h: string; sub: string; wide?: boolean; children: preact.ComponentChildren }) {
  return (
    <section class="band" id={id}>
      <div class={wide ? "col col--wide" : "col"}>
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
  const [why, setWhy] = useState(false);
  const apps = [
    { icon: "studio", name: "Studio", platform: t.apps.web, desc: t.apps.studio },
    { icon: "phone", name: "Mobile", platform: t.apps.phone, desc: t.apps.mobile },
    { icon: "admin", name: "Admin", platform: t.apps.web, desc: t.apps.admin },
  ];
  return (
    <>
      <Top>
        <nav class="top__nav" aria-label="Page">
          <a href="#apps">{t.nav.apps}</a>
          <a href="#support">{t.nav.support}</a>
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
            <LinkButton href="#waitlist" size="lg" icon="arrow-down">{t.hero.join}</LinkButton>
            <LinkButton href="#ideas" size="lg" kind="secondary">{t.hero.idea}</LinkButton>
            <LinkButton href={CORE} size="lg" kind="ghost" icon="github" rel="noopener">{t.hero.source}</LinkButton>
          </div>
          <ul class="hero__apps" aria-hidden="true">
            {apps.map((a) => <li key={a.icon}><img src={`/icons/${a.icon}.svg`} alt="" width="96" height="96" /></li>)}
          </ul>
        </section>

        <Band id="origin" n={1} h={t.origin.h} sub={t.origin.sub}><Voice p={t.origin.p} /></Band>
        <Band id="for" n={2} h={t.who.h} sub={t.who.sub}><div class="prose">{t.who.p.map((s) => <p key={s}>{s}</p>)}</div></Band>

        <Band id="apps" n={3} h={t.apps.h} sub={t.apps.sub} wide>
          <p class="prose prose--center">{t.apps.note}</p>
          <ul class="apps">
            {apps.map((a) => (
              <li class="app" key={a.icon}>
                <img src={`/icons/${a.icon}.svg`} alt="" width="72" height="72" />
                <h3>{a.name}</h3>
                <span class="pill pill--later">{a.platform}</span>
                <p>{a.desc}</p>
              </li>
            ))}
          </ul>
        </Band>

        <Band id="flex" n={4} h={t.flex.h} sub={t.flex.sub}><Voice p={t.flex.p} /></Band>

        <Band id="support" n={5} h={t.support.h} sub={t.support.sub}>
          <ul class="support">
            <li><span class="tag">{t.support.browsersTag}</span><div><h3>{t.support.browsersH}</h3><p>{t.support.browsers}</p></div></li>
            <li><span class="tag">{t.support.mobileTag}</span><div><h3>{t.support.mobileH}</h3><p>{t.support.mobile}</p><span class="pill pill--soon">{t.support.ios}</span></div></li>
            <li><span class="tag">{t.support.hostTag}</span><div><h3>{t.support.hostH}</h3><p>{t.support.host}</p><span><Button kind="secondary" size="sm" onClick={() => setWhy(true)}>{t.support.why}</Button></span></div></li>
          </ul>
          <Modal open={why} onClose={() => setWhy(false)} title={t.support.whyTitle}>
            <p>{t.support.whyIntro}</p>
            <h3>GitHub</h3>
            <p>{t.support.github}</p>
            <h3>Cloudflare</h3>
            <p>{t.support.cloudflare1}</p>
            <p>{t.support.cloudflare2}</p>
            <h3>{t.support.bothH}</h3>
            <p>{t.support.both}</p>
          </Modal>
        </Band>

        <Band id="alpha" n={6} h={t.alpha.h} sub={t.alpha.sub}><Voice p={t.alpha.p} /></Band>
        <Band id="maintainer" n={7} h={t.maintainer.h} sub={t.maintainer.sub}><Voice p={t.maintainer.p} /></Band>
        <Band id="hosted" n={8} h={t.hosted.h} sub={t.hosted.sub}><Voice p={t.hosted.p} /></Band>

        <Band id="plan" n={9} h={t.plan.h} sub={t.plan.sub}>
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

        <Band id="ideas" n={10} h={t.ideas.h} sub={t.ideas.sub}>
          <Voice p={[...t.ideas.p, t.ideas.language]} />
          <Requests />
        </Band>

        <Band id="waitlist" n={11} h={t.waitlist.h} sub={t.waitlist.sub}>
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
