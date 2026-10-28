/** The optional "about you" block both forms share: positions (many), what "other" means, years in the industry. */
import { DEPARTMENT_LABEL, DEPARTMENTS, LIMITS, positionById, searchPositions } from "@openclapper/home-vocab";
import { Chip, Field, Icon, Input } from "@openclapper/home-ui";
import { useState } from "preact/hooks";

export interface PersonState { positions: string[]; other_position: string; years: string }
export const emptyPerson = (): PersonState => ({ positions: [], other_position: "", years: "" });
export const personIsEmpty = (p: PersonState) => p.positions.length === 0 && !p.other_position && !p.years;
/** What the API takes (packages/vocab parses it strictly). */
export const personBody = (p: PersonState) => ({ positions: p.positions, other_position: p.other_position || null, years: p.years === "" ? null : Number(p.years) });

export function PersonFields({ value, onChange, errors }: { value: PersonState; onChange: (p: PersonState) => void; errors: Record<string, string> }) {
  const [q, setQ] = useState("");
  const toggle = (id: string) => onChange({ ...value, positions: value.positions.includes(id) ? value.positions.filter((p) => p !== id) : [...value.positions, id] });
  const hits = searchPositions(q);
  const grouped = DEPARTMENTS.map((d) => ({ d, items: hits.filter((p) => p.department === d) })).filter((g) => g.items.length);
  return (
    <>
      <Field label="Your positions" help={`Pick every role you have worked in; many people have more than one. ${value.positions.length ? "" : "Type to filter: DP, Gaffer, Aufnahmeleitung…"}`} error={errors.positions}>
        {(id, invalid) => (
          <div class="positions">
            {value.positions.length > 0 && (
              <div class="positions__picked" aria-label="Picked positions">
                {value.positions.map((p) => <Chip key={p} selected onClick={() => toggle(p)} aria-label={`Remove ${positionById(p)?.label ?? p}`}>{positionById(p)?.label ?? p}<Icon name="close" /></Chip>)}
              </div>
            )}
            <Input id={id} invalid={invalid} type="search" placeholder="Filter positions" value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label="Filter positions" />
            <div class="positions__list" role="group" aria-label="Positions by department">
              {grouped.length === 0 && <span class="meta">No position matches "{q}". Pick "Other" and write it in.</span>}
              {grouped.map(({ d, items }) => (
                <div class="positions__group" key={d}>
                  <span class="positions__dept">{DEPARTMENT_LABEL[d]}</span>
                  <div class="f-chips">{items.map((p) => <Chip key={p.id} selected={value.positions.includes(p.id)} onClick={() => toggle(p.id)} disabled={!value.positions.includes(p.id) && value.positions.length >= LIMITS.positions}>{p.label}</Chip>)}</div>
                </div>
              ))}
            </div>
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
