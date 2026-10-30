/**
 * The "about you" block both forms share, all of it required: the film systems (many), positions
 * (many, "other" named), years in the industry (a band), the languages to test or answer questions in
 * (many, "other" named). The position list opens on demand; the picked ones always show.
 */
import { DEPARTMENT_LABEL, DEPARTMENTS, LANGUAGE_LABEL, LANGUAGES, LIMITS, PLATFORM_LABEL, PLATFORMS, positionById, searchPositions, SYSTEM_LABEL, SYSTEMS, YEARS, YEARS_LABEL, type FilmSystem, type Language, type Platform, type YearsBand } from "@openclapper/home-vocab";
import { Button, Chip, Field, Icon, Input } from "@openclapper/home-ui";
import { useState } from "preact/hooks";
import { t } from "./copy.ts";

export interface PersonState { systems: FilmSystem[]; positions: string[]; other_position: string; years: YearsBand | ""; languages: Language[]; other_language: string }
export const emptyPerson = (): PersonState => ({ systems: [], positions: [], other_position: "", years: "", languages: [], other_language: "" });
export const personIsEmpty = (p: PersonState) => p.systems.length === 0 && p.positions.length === 0 && !p.other_position && !p.years && p.languages.length === 0 && !p.other_language;
/** What the API takes (packages/vocab parses it strictly). */
export const personBody = (p: PersonState) => ({ systems: p.systems, positions: p.positions, other_position: p.other_position || null, years: p.years || null, languages: p.languages, other_language: p.other_language || null });

const toggled = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

/** The block's heading with the reason it is required; the request form adds the anonymity note. */
export function AboutHead({ why, anon }: { why: string; anon?: boolean }) {
  return (
    <div class="about__head">
      <h3>{t.form.aboutH}</h3>
      <p>{why}</p>
      {anon && <p>{t.form.aboutAnon}</p>}
    </div>
  );
}

/** Which platforms the person could test on: chips, many; required where the form says so. */
export function Platforms({ value, onChange, error }: { value: Platform[]; onChange: (v: Platform[]) => void; error?: string }) {
  const f = t.form;
  return (
    <Field label={f.platforms} help={f.platformsHelp} required error={error}>
      {(id) => <div class="f-chips" id={id} role="group" aria-label={f.platformsAria}>{PLATFORMS.map((p) => <Chip key={p} selected={value.includes(p)} onClick={() => onChange(toggled(value, p))}>{PLATFORM_LABEL[p]}</Chip>)}</div>}
    </Field>
  );
}

export function PersonFields({ value, onChange, errors }: { value: PersonState; onChange: (p: PersonState) => void; errors: Record<string, string> }) {
  const f = t.form;
  const [q, setQ] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const togglePosition = (id: string) => onChange({ ...value, positions: toggled(value.positions, id) });
  const hits = searchPositions(q);
  const grouped = DEPARTMENTS.map((d) => ({ d, items: hits.filter((p) => p.department === d) })).filter((g) => g.items.length);
  const showList = listOpen || q.length > 0;
  return (
    <>
      <Field label={f.systems} help={f.systemsHelp} error={errors.systems} required>
        {(id) => <div class="f-chips" id={id} role="group" aria-label={f.systemsAria}>{SYSTEMS.map((s) => <Chip key={s} selected={value.systems.includes(s)} onClick={() => onChange({ ...value, systems: toggled(value.systems, s) })}>{SYSTEM_LABEL[s]}</Chip>)}</div>}
      </Field>
      <Field label={f.positions} help={f.positionsHelp} error={errors.positions} required>
        {(id, invalid) => (
          <div class="positions">
            <div class="positions__picked">
              {value.positions.map((p) => <Chip key={p} selected onClick={() => togglePosition(p)} aria-label={f.remove(positionById(p)?.label ?? p)}>{positionById(p)?.label ?? p}<Icon name="close" /></Chip>)}
              <Button kind="secondary" size="sm" icon={showList ? "minus" : "plus"} aria-expanded={showList} onClick={() => { setListOpen(!showList); setQ(""); }}>{showList ? f.closeList : value.positions.length ? f.add : f.pick}</Button>
            </div>
            {showList && (
              <>
                <Input id={id} invalid={invalid} type="search" placeholder={f.filter} value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label={f.filterAria} />
                <div class="positions__list" role="group" aria-label={f.byDept}>
                  {grouped.length === 0 && <span class="meta">{f.noMatch(q)}</span>}
                  {grouped.map(({ d, items }) => (
                    <div class="positions__group" key={d}>
                      <span class="positions__dept">{DEPARTMENT_LABEL[d]}</span>
                      <div class="f-chips">{items.map((p) => <Chip key={p.id} selected={value.positions.includes(p.id)} onClick={() => togglePosition(p.id)} disabled={!value.positions.includes(p.id) && value.positions.length >= LIMITS.positions}>{p.label}</Chip>)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Field>
      {value.positions.includes("other") && (
        <Field label={f.other} error={errors.other_position} required>
          {(id, invalid) => <Input id={id} invalid={invalid} maxLength={LIMITS.otherPosition} value={value.other_position} onInput={(e) => onChange({ ...value, other_position: e.currentTarget.value })} placeholder={f.otherPh} />}
        </Field>
      )}
      <Field label={f.years} help={f.yearsHelp} error={errors.years} required>
        {(id) => (
          <div class="f-seg" role="radiogroup" id={id} aria-label={f.yearsAria}>
            {YEARS.map((y) => <button type="button" class="f-seg__opt" role="radio" aria-checked={value.years === y} key={y} onClick={() => onChange({ ...value, years: y })}>{YEARS_LABEL[y]}</button>)}
          </div>
        )}
      </Field>
      <Field label={f.languages} help={f.languagesHelp} error={errors.languages} required>
        {(id) => <div class="f-chips" id={id} role="group" aria-label={f.languagesAria}>{LANGUAGES.map((l) => <Chip key={l} selected={value.languages.includes(l)} onClick={() => onChange({ ...value, languages: toggled(value.languages, l) })}>{LANGUAGE_LABEL[l]}</Chip>)}</div>}
      </Field>
      {value.languages.includes("other") && (
        <Field label={f.otherLanguage} error={errors.other_language} required>
          {(id, invalid) => <Input id={id} invalid={invalid} maxLength={LIMITS.otherLanguage} value={value.other_language} onInput={(e) => onChange({ ...value, other_language: e.currentTarget.value })} placeholder={f.otherLanguagePh} />}
        </Field>
      )}
    </>
  );
}
