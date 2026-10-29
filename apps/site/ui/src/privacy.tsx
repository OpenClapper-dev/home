import { render } from "preact";
import "@openclapper/home-ui";
import "./site.css";
import { useT } from "./i18n.ts";
import { CORE, Top } from "./Page.tsx";

const CONTACT = "hello@openclapper.org";

/** The privacy page, in the chosen language, with the same bar as the page. */
function Privacy() {
  const [t] = useT();
  const p = t.privacy;
  document.title = `${p.title} · OpenClapper`;
  return (
    <>
      <Top><nav class="top__nav top__nav--keep" aria-label="Page"><a href="/">{p.home}</a></nav></Top>
      <main class="page--narrow">
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
      </main>
      <footer class="foot"><span>{t.foot.license}</span><a href={CORE} rel="noopener">GitHub</a><a href="/privacy">{t.foot.privacy}</a></footer>
    </>
  );
}

render(<Privacy />, document.getElementById("app")!);
