/**
 * The sign-up: the tester waiting list (roadmap step five), the Call Sheet (a mail when the roadmap
 * moves), or both. An email, for testers the platforms they could test on, and the about-you block,
 * all required. Double opt-in through the confirmation mail.
 */
import { LIMITS, type Platform } from "@openclapper/home-vocab";
import { Banner, Button, Check, Field, Input } from "@openclapper/home-ui";
import { useState } from "preact/hooks";
import { ApiError, post } from "./api.ts";
import { t } from "./copy.ts";
import { useDraft } from "./drafts.ts";
import { AboutHead, emptyPerson, PersonFields, personBody, personIsEmpty, type PersonState, Platforms } from "./PersonFields.tsx";
import { useTurnstile } from "./turnstile.ts";

interface State { email: string; tester: boolean; updates: boolean; platforms: Platform[]; person: PersonState }
const empty = (): State => ({ email: "", tester: true, updates: false, platforms: [], person: emptyPerson() });
const isEmpty = (s: State) => !s.email && s.tester && !s.updates && s.platforms.length === 0 && personIsEmpty(s.person);

export function Waitlist({ confirmed }: { confirmed: "yes" | "no" | null }) {
  const [s, set, draft] = useDraft<State>("draft:waitlist", empty, isEmpty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const ts = useTurnstile("waitlist");

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!ts.token) { setErrors({ turnstile: t.form.botWait }); return; }
    setBusy(true);
    setErrors({});
    try {
      await post("/api/waitlist", { email: s.email, tester: s.tester, updates: s.updates, platforms: s.tester ? s.platforms : [], ...personBody(s.person), turnstile: ts.token });
      setDone(s.email);
      draft.discard();
    } catch (err) {
      const a = err as ApiError;
      setErrors({ [a.field ?? "form"]: a.message });
    } finally {
      setBusy(false);
      ts.reset();
    }
  };

  if (done) return <Banner kind="ok" title={t.wl.doneTitle} role="status">{t.wl.done(done)}</Banner>;
  return (
    <form class="form" onSubmit={submit} noValidate>
      {confirmed === "yes" && <Banner kind="ok" title={t.wl.confirmedTitle} role="status">{t.wl.confirmed}</Banner>}
      {confirmed === "no" && <Banner kind="warn" title={t.wl.expiredTitle} role="alert">{t.wl.expired}</Banner>}
      {draft.restored && <div class="form__draft">{t.form.draftRestored} <button type="button" class="f-linkbtn" onClick={draft.discard}>{t.form.startOver}</button></div>}
      <Field label={t.wl.email} required help={t.wl.emailHelp} error={errors.email}>
        {(id, invalid) => <Input id={id} invalid={invalid} type="email" autoComplete="email" required maxLength={LIMITS.email} value={s.email} onInput={(e) => set({ ...s, email: e.currentTarget.value })} />}
      </Field>
      <Field label={t.wl.want} required error={errors.tester}>
        {(id) => (
          <div class="want" id={id} role="group" aria-label={t.wl.want}>
            <Check checked={s.tester} onChange={(v) => set({ ...s, tester: v })}><span class="want__label">{t.wl.wantTester}</span><span class="meta">{t.wl.wantTesterHelp}</span></Check>
            <Check checked={s.updates} onChange={(v) => set({ ...s, updates: v })}><span class="want__label">{t.wl.wantUpdates}</span><span class="meta">{t.wl.wantUpdatesHelp}</span></Check>
          </div>
        )}
      </Field>
      {s.tester && <Platforms value={s.platforms} onChange={(platforms) => set({ ...s, platforms })} error={errors.platforms} />}
      <div class="about">
        <AboutHead why={t.wl.aboutWhy} />
        <PersonFields value={s.person} onChange={(person) => set({ ...s, person })} errors={errors} />
      </div>
      <div class="turnstile" ref={ts.ref} />
      {(errors.turnstile || errors.form || ts.failed) && <Banner kind="danger" title={errors.form ?? errors.turnstile ?? t.form.botFailed} role="alert">{ts.failed && !errors.form ? t.form.reload : undefined}</Banner>}
      <div class="form__actions">
        <Button type="submit" size="lg" loading={busy}>{t.wl.submit}</Button>
        <span class="form__fine">{t.wl.fine} <a href="/privacy">{t.form.privacy}</a></span>
      </div>
    </form>
  );
}
