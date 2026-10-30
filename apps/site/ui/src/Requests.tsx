/**
 * Feature requests: one or many per submission, each with an optional title, the text, and whether
 * the person would answer questions while it takes shape. The about-you block is required and comes
 * once: the owner needs to see which direction input comes from. No name is asked; an email only when
 * the person wants questions (or a thank-you mail).
 */
import { LIMITS } from "@openclapper/home-vocab";
import { Banner, Button, Check, Field, IconButton, Input, Textarea } from "@openclapper/home-ui";
import { useState } from "preact/hooks";
import { ApiError, post } from "./api.ts";
import { t } from "./copy.ts";
import { useDraft } from "./drafts.ts";
import { AboutHead, emptyPerson, PersonFields, personBody, personIsEmpty, type PersonState } from "./PersonFields.tsx";
import { useTurnstile } from "./turnstile.ts";

interface Entry { title: string; text: string; prototype: boolean }
interface State { entries: Entry[]; person: PersonState; email: string }
const emptyEntry = (): Entry => ({ title: "", text: "", prototype: false });
const empty = (): State => ({ entries: [emptyEntry()], person: emptyPerson(), email: "" });
const isEmpty = (s: State) => s.entries.every((e) => !e.title && !e.text && !e.prototype) && personIsEmpty(s.person) && !s.email;

export function Requests() {
  const r = t.rq;
  const [s, set, draft] = useDraft<State>("draft:requests", empty, isEmpty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const ts = useTurnstile("request");

  const patch = (i: number, p: Partial<Entry>) => set({ ...s, entries: s.entries.map((e, j) => (j === i ? { ...e, ...p } : e)) });
  const wantsEmail = s.entries.some((e) => e.prototype);

  const submit = async (e: Event) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    s.entries.forEach((en, i) => { if (!en.text.trim()) errs[`entries.${i}.text`] = r.textRequired; });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!ts.token) { setErrors({ turnstile: t.form.botWait }); return; }
    setBusy(true);
    setErrors({});
    try {
      await post("/api/requests", { entries: s.entries.map((en) => ({ title: en.title || null, text: en.text, prototype: en.prototype })), ...personBody(s.person), email: s.email || null, turnstile: ts.token });
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
      <Banner kind="ok" title={done === 1 ? r.doneTitle1 : r.doneTitleN(done)} role="status" action={<Button kind="secondary" size="sm" onClick={() => setDone(0)}>{r.another}</Button>}>{r.done}</Banner>
    );
  }
  return (
    <form class="form" onSubmit={submit} noValidate>
      {draft.restored && <div class="form__draft">{t.form.draftRestored} <button type="button" class="f-linkbtn" onClick={draft.discard}>{t.form.startOver}</button></div>}
      {s.entries.map((en, i) => (
        <div class="entry" key={i}>
          <div class="entry__head">
            <span class="entry__n">{r.n(i + 1)}</span>
            {s.entries.length > 1 && <IconButton icon="delete" size="sm" label={r.removeN(i + 1)} onClick={() => set({ ...s, entries: s.entries.filter((_, j) => j !== i) })} />}
          </div>
          <Field label={r.title} error={errors[`entries.${i}.title`]} optional={t.form.optional}>
            {(id, invalid) => <Input id={id} invalid={invalid} maxLength={LIMITS.title} value={en.title} onInput={(e) => patch(i, { title: e.currentTarget.value })} placeholder={r.titlePh} />}
          </Field>
          <Field label={r.text} required help={r.textHelp} error={errors[`entries.${i}.text`]}>
            {(id, invalid) => <Textarea id={id} invalid={invalid} required maxLength={LIMITS.text} rows={6} value={en.text} onInput={(e) => patch(i, { text: e.currentTarget.value })} />}
          </Field>
          <div class="entry__flags">
            <Check checked={en.prototype} onChange={(v) => patch(i, { prototype: v })}>{r.prototype}</Check>
          </div>
        </div>
      ))}
      <div>
        <Button kind="secondary" icon="plus" disabled={s.entries.length >= LIMITS.entries} onClick={() => set({ ...s, entries: [...s.entries, emptyEntry()] })}>{r.addAnother}</Button>
      </div>
      <div class="about">
        <AboutHead why={t.form.aboutWhy} anon />
        <PersonFields value={s.person} onChange={(person) => set({ ...s, person })} errors={errors} />
        <Field label={r.email} required={wantsEmail} help={wantsEmail ? r.emailHelpWants : r.emailHelp} error={errors.email} optional={t.form.optional}>
          {(id, invalid) => <Input id={id} invalid={invalid} type="email" autoComplete="email" maxLength={LIMITS.email} value={s.email} onInput={(e) => set({ ...s, email: e.currentTarget.value })} />}
        </Field>
      </div>
      <div class="turnstile" ref={ts.ref} />
      {(errors.turnstile || errors.form || errors.entries || ts.failed) && <Banner kind="danger" title={errors.form ?? errors.entries ?? errors.turnstile ?? t.form.botFailed} role="alert">{ts.failed && !errors.form ? t.form.reload : undefined}</Banner>}
      <div class="form__actions">
        <Button type="submit" size="lg" loading={busy}>{s.entries.length > 1 ? r.submitN(s.entries.length) : r.submit1}</Button>
        <span class="form__fine">{r.fine} <a href="/privacy">{t.form.privacy}</a></span>
      </div>
    </form>
  );
}
