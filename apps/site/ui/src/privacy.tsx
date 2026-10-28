import { render } from "preact";
import "@openclapper/home-ui";
import "./site.css";
import { Button, IconButton, THEME_CYCLE, THEME_ICON, THEME_LABEL, useTheme } from "@openclapper/home-ui";
import { useT } from "./i18n.ts";

const CONTACT = "hello@openclapper.org";

/** The privacy page, in the chosen language, with the same header controls as the page. */
function Privacy() {
  const [theme, setTheme] = useTheme();
  const [t, lang, setLang] = useT();
  const p = t.privacy;
  document.title = `${p.title} · OpenClapper`;
  return (
    <main class="page page--narrow">
      <header class="top">
        <a class="top__brand" href="/"><img src="/icons/favicon.svg" alt="" width="24" height="24" />OpenClapper</a>
        <nav class="top__nav">
          <a href="/">{p.home}</a>
          <Button kind="ghost" size="sm" icon="translate" title={t.nav.langTitle} aria-label={t.nav.langTitle} lang={lang === "en" ? "de" : "en"} onClick={() => setLang(lang === "en" ? "de" : "en")}>{t.nav.lang}</Button>
          <IconButton icon={THEME_ICON[theme]} label={THEME_LABEL[theme]} onClick={() => setTheme(THEME_CYCLE[theme])} />
        </nav>
      </header>
      <article class="prose">
        <h1>{p.title}</h1>
        <p class="lede">{p.lede}</p>
        <h2>{p.hostingH}</h2><p>{p.hosting}</p>
        <h2>{p.botH}</h2><p>{p.bot}</p>
        <h2>{p.wlH}</h2><p>{p.wl1}</p><p>{p.wl2}</p>
        <h2>{p.rqH}</h2><p>{p.rq1}</p><p>{p.rq2}</p>
        <h2>{p.storageH}</h2><p>{p.storage}</p>
        <h2>{p.rightsH}</h2>
        <p>{p.rights1} <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. {p.rights2}</p>
        <p class="meta">{p.responsible}</p>
      </article>
      <footer class="foot"><span>{t.foot.license}</span><a href="https://github.com/OpenClapper-dev/core">GitHub</a><a href="/privacy">{t.foot.privacy}</a></footer>
    </main>
  );
}

render(<Privacy />, document.getElementById("app")!);
