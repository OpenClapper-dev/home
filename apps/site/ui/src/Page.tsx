/**
 * openclapper.org: what the project is, where it comes from, the three apps, the state of support,
 * alpha, the maintainer, the hosted version, then the two forms. Every string comes from i18n.ts in the
 * chosen language; the sections in the owner's voice are marked (.voice).
 */
import { Button, IconButton, LinkButton, Modal, THEME_CYCLE, THEME_ICON, THEME_LABEL, useTheme } from "@openclapper/home-ui";
import { useEffect, useState } from "preact/hooks";
import { useT } from "./i18n.ts";
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

const Voice = ({ p }: { p: string[] }) => <div class="prose voice">{p.map((s) => <p key={s}>{s}</p>)}</div>;

export function Page() {
  const [theme, setTheme] = useTheme();
  const [t, lang, setLang] = useT();
  const confirmed = useConfirmed();
  const [why, setWhy] = useState(false);
  return (
    <main class="page">
      <header class="top">
        <a class="top__brand" href="/"><img src="/icons/favicon.svg" alt="" width="24" height="24" />OpenClapper</a>
        <nav class="top__nav" aria-label="Page">
          <a class="top__link" href="#apps">{t.nav.apps}</a>
          <a class="top__link" href="#support">{t.nav.support}</a>
          <a class="top__link" href="#ideas">{t.nav.ideas}</a>
          <a class="top__link" href="#waitlist">{t.nav.waitlist}</a>
          <a href={CORE} rel="noopener">GitHub</a>
          <Button kind="ghost" size="sm" icon="translate" title={t.nav.langTitle} aria-label={t.nav.langTitle} lang={lang === "en" ? "de" : "en"} onClick={() => setLang(lang === "en" ? "de" : "en")}>{t.nav.lang}</Button>
          <IconButton icon={THEME_ICON[theme]} label={THEME_LABEL[theme]} onClick={() => setTheme(THEME_CYCLE[theme])} />
        </nav>
      </header>

      <section class="hero">
        <span class="hero__status">{t.hero.status}</span>
        <h1>{t.hero.title}</h1>
        <p class="lede">{t.hero.lede}</p>
        <div class="hero__cta">
          <LinkButton href="#waitlist" size="lg" icon="arrow-down">{t.hero.join}</LinkButton>
          <LinkButton href="#ideas" size="lg" kind="secondary">{t.hero.idea}</LinkButton>
          <LinkButton href={CORE} size="lg" kind="ghost" icon="github" rel="noopener">{t.hero.source}</LinkButton>
        </div>
      </section>

      <section class="sec" id="origin">
        <h2>{t.origin.h}</h2>
        <p class="sec__sub">{t.origin.sub}</p>
        <Voice p={t.origin.p} />
      </section>

      <section class="sec" id="for">
        <h2>{t.who.h}</h2>
        <p class="sec__sub">{t.who.sub}</p>
        <div class="prose">{t.who.p.map((s) => <p key={s}>{s}</p>)}</div>
      </section>

      <section class="sec" id="apps">
        <h2>{t.apps.h}</h2>
        <p class="sec__sub">{t.apps.sub}</p>
        <p class="prose">{t.apps.note}</p>
        <div class="eco">
          <div class="eco__head" aria-hidden="true"><span /><span>{t.apps.cols.app}</span><span>{t.apps.cols.platform}</span><span>{t.apps.cols.what}</span></div>
          {([["studio", "Studio", t.apps.web, t.apps.studio], ["phone", "Mobile", t.apps.phone, t.apps.mobile], ["admin", "Admin", t.apps.web, t.apps.admin]] as const).map(([icon, name, platform, desc]) => (
            <div class="eco__row" key={icon}>
              <img class="eco__icon" src={`/icons/${icon}.svg`} alt="" width="96" height="96" />
              <h3 class="eco__name">{name}</h3>
              <span class="eco__platform">{platform}</span>
              <p class="eco__desc">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section class="sec" id="support">
        <h2>{t.support.h}</h2>
        <p class="sec__sub">{t.support.sub}</p>
        <div class="apps">
          <article class="card">
            <span class="card__tag">{t.support.browsersTag}</span>
            <h3>{t.support.browsersH}</h3>
            <p>{t.support.browsers}</p>
          </article>
          <article class="card">
            <span class="card__tag">{t.support.mobileTag}</span>
            <h3>{t.support.mobileH}</h3>
            <p>{t.support.mobile}</p>
            <span class="pill pill--soon">{t.support.ios}</span>
          </article>
          <article class="card">
            <span class="card__tag">{t.support.hostTag}</span>
            <h3>{t.support.hostH}</h3>
            <p>{t.support.host}</p>
            <div><Button kind="secondary" size="sm" onClick={() => setWhy(true)}>{t.support.why}</Button></div>
          </article>
        </div>
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
      </section>

      <section class="sec" id="alpha">
        <h2>{t.alpha.h}</h2>
        <p class="sec__sub">{t.alpha.sub}</p>
        <Voice p={t.alpha.p} />
      </section>

      <section class="sec" id="maintainer">
        <h2>{t.maintainer.h}</h2>
        <p class="sec__sub">{t.maintainer.sub}</p>
        <Voice p={t.maintainer.p} />
      </section>

      <section class="sec" id="hosted">
        <h2>{t.hosted.h}</h2>
        <p class="sec__sub">{t.hosted.sub}</p>
        <Voice p={t.hosted.p} />
      </section>

      <section class="sec" id="ideas">
        <h2>{t.ideas.h}</h2>
        <p class="sec__sub">{t.ideas.sub}</p>
        <Voice p={[...t.ideas.p, t.ideas.language]} />
        <Requests />
      </section>

      <section class="sec" id="waitlist">
        <h2>{t.waitlist.h}</h2>
        <p class="sec__sub">{t.waitlist.sub}</p>
        <p class="prose">{t.waitlist.p}</p>
        <Waitlist confirmed={confirmed} />
      </section>

      <footer class="foot">
        <span>{t.foot.license}</span>
        <a href={CORE} rel="noopener">GitHub</a>
        <a href="/privacy">{t.foot.privacy}</a>
        <span class="num">v{__HOME_VERSION__} ({__HOME_COMMIT__})</span>
      </footer>
    </main>
  );
}
