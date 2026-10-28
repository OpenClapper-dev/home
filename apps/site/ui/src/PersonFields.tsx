/**
 * The optional "about you" block both forms share, folded behind one button: positions (many), what
 * "other" means, years in the industry. The position list itself opens on demand too; the picked ones
 * always show.
 */
import { DEPARTMENT_LABEL, DEPARTMENTS, LIMITS, positionById, searchPositions, SYSTEM_LABEL, SYSTEMS, type FilmSystem } from "@openclapper/home-vocab";
import { Button, Chip, Field, Icon, Input } from "@openclapper/home-ui";
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";

export interface PersonState { system: FilmSystem | ""; positions: string[]; other_position: string; years: string }
export const emptyPerson = (): PersonState => ({ system: "", positions: [], other_position: "", years: "" });
export const personIsEmpty = (p: PersonState) => !p.system && p.positions.length === 0 && !p.other_position && !p.years;
/** What the API takes (packages/vocab parses it strictly). */
export const personBody = (p: PersonState) => ({ system: p.system || null, positions: p.positions, other_position: p.other_position || null, years: p.years === "" ? null : Number(p.years) });

/** A block that opens on a click and stays open once it holds something (a restored draft, an error). */
export function Disclose({ label, open: forced, children }: { label: string; open?: boolean; children: ComponentChildren }) {
  const [open, setOpen] = useState(false);
  const shown = open || !!forced;
  return (
    <div class="disclose">
      <div><Button kind="secondary" icon={shown ? "minus" : "plus"} aria-expanded={shown} onClick={() => setOpen(!shown)}>{label}</Button></div>
      {shown && <div class="disclose__body">{children}</div>}
    </div>
  );
}

export function PersonFields({ value, onChange, errors }: { value: PersonState; onChange: (p: PersonState) => void; errors: Record<string, string> }) {
  const [q, setQ] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const toggle = (id: string) => onChange({ ...value, positions: value.positions.includes(id) ? value.positions.filter((p) => p !== id) : [...value.positions, id] });
  const hits = searchPositions(q);
  const grouped = DEPARTMENTS.map((d) => ({ d, items: hits.filter((p) => p.department === d) })).filter((g) => g.items.length);
  const showList = listOpen || q.length > 0;
  return (
    <>
      <Field label="Which system did you work in?" help="Titles and habits differ; it helps me read your positions right. Click again to clear." error={errors.system}>
        {(id) => (
          <div class="f-seg" role="radiogroup" id={id} aria-label="Film system">
            {SYSTEMS.map((s) => <button type="button" class="f-seg__opt" role="radio" aria-checked={value.system === s} key={s} onClick={() => onChange({ ...value, system: value.system === s ? "" : s })}>{SYSTEM_LABEL[s]}</button>)}
          </div>
        )}
      </Field>
      <Field label="Your positions" help="Every role you have worked in; many people have more than one." error={errors.positions}>
        {(id, invalid) => (
          <div class="positions">
            <div class="positions__picked">
              {value.positions.map((p) => <Chip key={p} selected onClick={() => toggle(p)} aria-label={`Remove ${positionById(p)?.label ?? p}`}>{positionById(p)?.label ?? p}<Icon name="close" /></Chip>)}
              <Button kind="secondary" size="sm" icon={showList ? "minus" : "plus"} aria-expanded={showList} onClick={() => { setListOpen(!showList); setQ(""); }}>{showList ? "Close the list" : value.positions.length ? "Add a position" : "Pick positions"}</Button>
            </div>
            {showList && (
              <>
                <Input id={id} invalid={invalid} type="search" placeholder="Filter: DP, Gaffer, Aufnahmeleitung…" value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label="Filter positions" />
                <div class="positions__list" role="group" aria-label="Positions by department">
                  {grouped.length === 0 && <span class="meta">No position matches "{q}". Pick "Other" and write it in.</span>}
                  {grouped.map(({ d, items }) => (
                    <div class="positions__group" key={d}>
                      <span class="positions__dept">{DEPARTMENT_LABEL[d]}</span>
                      <div class="f-chips">{items.map((p) => <Chip key={p.id} selected={value.positions.includes(p.id)} onClick={() => toggle(p.id)} disabled={!value.positions.includes(p.id) && value.positions.length >= LIMITS.positions}>{p.label}</Chip>)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Field>
      <div class="form__row">
        {value.positions.includes("other") && (
          <Field label="What is “other”?" error={errors.other_position}>
            {(id, invalid) => <Input id={id} invalid={invalid} maxLength={LIMITS.otherPosition} value={value.other_position} onInput={(e) => onChange({ ...value, other_position: e.currentTarget.value })} placeholder="Drone pilot, intimacy coordinator…" />}
          </Field>
        )}
        <Field label="Years in the industry" help="Altogether, across every position." error={errors.years}>
          {(id, invalid) => <Input id={id} invalid={invalid} type="number" inputMode="numeric" min={0} max={LIMITS.years} step={1} value={value.years} onInput={(e) => onChange({ ...value, years: e.currentTarget.value })} style={{ maxWidth: 140 }} />}
        </Field>
      </div>
    </>
  );
}
