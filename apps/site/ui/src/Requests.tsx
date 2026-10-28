/**
 * Feature requests: one or many per submission, each with an optional title, the text, and whether
 * the person would test or help shape it. A pair of global toggles sets every entry; once entries
 * differ, the global one shows mixed. The person block and the contact come once.
 */
import { LIMITS } from "@openclapper/home-vocab";
import { Banner, Button, Check, Field, IconButton, Input, Textarea } from "@openclapper/home-ui";
import { useState } from "preact/hooks";
import { ApiError, post } from "./api.ts";
import { useDraft } from "./drafts.ts";
import { Disclose, emptyPerson, PersonFields, personBody, personIsEmpty, type PersonState } from "./PersonFields.tsx";
import { useTurnstile } from "./turnstile.ts";

interface Entry { title: string; text: string; test: boolean; prototype: boolean }
interface State { entries: Entry[]; person: PersonState; contact: string }
const emptyEntry = (): Entry => ({ title: "", text: "", test: false, prototype: false });
const empty = (): State => ({ entries: [emptyEntry()], person: emptyPerson(), contact: "" });
const isEmpty = (s: State) => s.entries.every((e) => !e.title && !e.text && !e.test && !e.prototype) && personIsEmpty(s.person) && !s.contact;

export function Requests() {
  const [s, set, draft] = useDraft<State>("draft:requests", empty, isEmpty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const ts = useTurnstile("request");

  const patch = (i: number, p: Partial<Entry>) => set({ ...s, entries: s.entries.map((e, j) => (j === i ? { ...e, ...p } : e)) });
  const all = (flag: "test" | "prototype") => ({ on: s.entries.every((e) => e[flag]), mixed: s.entries.some((e) => e[flag]) && !s.entries.every((e) => e[flag]) });
  const setAll = (flag: "test" | "prototype", v: boolean) => set({ ...s, entries: s.entries.map((e) => ({ ...e, [flag]: v })) });
  const wantsContact = s.entries.some((e) => e.test || e.prototype);

  const submit = async (e: Event) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    s.entries.forEach((en, i) => { if (!en.text.trim()) errs[`entries.${i}.text`] = "Write what you need; a sentence is enough."; });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!ts.token) { setErrors({ turnstile: "The bot check has not finished yet; give it a moment." }); return; }
    setBusy(true);
    setErrors({});
    try {
      await post("/api/requests", { entries: s.entries.map((en) => ({ title: en.title || null, text: en.text, test: en.test, prototype: en.prototype })), ...personBody(s.person), contact: s.contact || null, turnstile: ts.token });
      setDone(s.entries.length);
      draft.discard();
    } catch (err) {
      const a = err as ApiError;
      setErrors({ [a.field ?? "form"]: a.message });
    } finally {
      setBusy(false);
      ts.reset();
    }
  };

  if (done) {
    return (
      <Banner kind="ok" title={done === 1 ? "Thank you, your request is in" : `Thank you, your ${done} requests are in`} role="status"
        action={<Button kind="secondary" size="sm" onClick={() => setDone(0)}>Send another</Button>}>I read every one of them.</Banner>
    );
  }
  return (
    <form class="form" onSubmit={submit} noValidate>
      {draft.restored && <div class="form__draft">Your unsent draft was restored. <button type="button" class="f-linkbtn" onClick={draft.discard}>Start over</button></div>}
      {s.entries.length > 1 && (
        <div class="flags">
          <span class="flags__label">For all {s.entries.length} requests at once (or set each one below):</span>
          <Check checked={all("test").on} indeterminate={all("test").mixed} onChange={(v) => setAll("test", v)}>I would test these</Check>
          <Check checked={all("prototype").on} indeterminate={all("prototype").mixed} onChange={(v) => setAll("prototype", v)}>Contact me while shaping these</Check>
        </div>
      )}
      {s.entries.map((en, i) => (
        <div class="entry" key={i}>
          <div class="entry__head">
            <span class="entry__n">Request {i + 1}</span>
            {s.entries.length > 1 && <IconButton icon="delete" size="sm" label={`Remove request ${i + 1}`} onClick={() => set({ ...s, entries: s.entries.filter((_, j) => j !== i) })} />}
          </div>
          <Field label="Title" error={errors[`entries.${i}.title`]}>
            {(id, invalid) => <Input id={id} invalid={invalid} maxLength={LIMITS.title} value={en.title} onInput={(e) => patch(i, { title: e.currentTarget.value })} placeholder="Call sheets on the phone" />}
          </Field>
          <Field label="What do you need?" required help="Brainstorm, bullet points, a rant about the last shoot: anything goes. Which department, what went wrong, what would have helped." error={errors[`entries.${i}.text`]}>
            {(id, invalid) => <Textarea id={id} invalid={invalid} required maxLength={LIMITS.text} rows={6} value={en.text} onInput={(e) => patch(i, { text: e.currentTarget.value })} />}
          </Field>
          <div class="entry__flags">
            <Check checked={en.test} onChange={(v) => patch(i, { test: v })}>I would test this</Check>
            <Check checked={en.prototype} onChange={(v) => patch(i, { prototype: v })}>Contact me while shaping this</Check>
          </div>
        </div>
      ))}
      <div>
        <Button kind="secondary" icon="plus" disabled={s.entries.length >= LIMITS.entries} onClick={() => set({ ...s, entries: [...s.entries, emptyEntry()] })}>Add another request</Button>
      </div>
      <Disclose label="A bit more information about you and how to reach me" open={wantsContact || !personIsEmpty(s.person) || !!s.contact || !!(errors.contact || errors.system || errors.positions || errors.years || errors.other_position)}>
      <PersonFields value={s.person} onChange={(person) => set({ ...s, person })} errors={errors} />
      <Field label="How to reach you" help={wantsContact ? "You asked to test or be contacted: say how, in your own words. An email, a handle on whatever network, a phone number; whatever you are comfortable with." : "Only if you want a reply. An email, a handle, anything; or leave it empty."} error={errors.contact}>
        {(id, invalid) => <Textarea id={id} invalid={invalid} maxLength={LIMITS.contact} rows={2} value={s.contact} onInput={(e) => set({ ...s, contact: e.currentTarget.value })} placeholder="@handle on Instagram, or name@example.com" />}
      </Field>
      </Disclose>
      <div class="turnstile" ref={ts.ref} />
      {(errors.turnstile || errors.form || errors.entries || ts.failed) && <Banner kind="danger" title={errors.form ?? errors.entries ?? errors.turnstile ?? "The bot check could not load"} role="alert">{ts.failed && !errors.form ? "Reload the page and try again." : undefined}</Banner>}
      <div class="form__actions">
        <Button type="submit" size="lg" loading={busy}>{s.entries.length > 1 ? `Send ${s.entries.length} requests` : "Send the request"}</Button>
        <span class="form__fine">No account, no name needed. Drafts stay in this browser until sent. <a href="/privacy">Privacy</a></span>
      </div>
    </form>
  );
}
