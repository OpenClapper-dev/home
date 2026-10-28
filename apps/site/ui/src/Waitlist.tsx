/** The tester waiting list: an email, the rest optional; double opt-in through the confirmation mail. */
import { LIMITS } from "@openclapper/home-vocab";
import { Banner, Button, Field, Input } from "@openclapper/home-ui";
import { useState } from "preact/hooks";
import { ApiError, post } from "./api.ts";
import { useDraft } from "./drafts.ts";
import { emptyPerson, PersonFields, personBody, personIsEmpty, type PersonState } from "./PersonFields.tsx";
import { useTurnstile } from "./turnstile.ts";

interface State { email: string; nickname: string; person: PersonState }
const empty = (): State => ({ email: "", nickname: "", person: emptyPerson() });
const isEmpty = (s: State) => !s.email && !s.nickname && personIsEmpty(s.person);

export function Waitlist({ confirmed }: { confirmed: "yes" | "no" | null }) {
  const [s, set, draft] = useDraft<State>("draft:waitlist", empty, isEmpty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const ts = useTurnstile("waitlist");

  const submit = async (e: Event) => {
    e.preventDefault();
    if (!ts.token) { setErrors({ turnstile: "The bot check has not finished yet; give it a moment." }); return; }
    setBusy(true);
    setErrors({});
    try {
      await post("/api/waitlist", { email: s.email, nickname: s.nickname || null, ...personBody(s.person), turnstile: ts.token });
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

  if (done) {
    return <Banner kind="ok" title="One more step: confirm your email" role="status">We sent a link to {done}. Open it within 7 days and you are on the list. No mail? Check the spam folder, then try again in ten minutes.</Banner>;
  }
  return (
    <form class="form" onSubmit={submit} noValidate>
      {confirmed === "yes" && <Banner kind="ok" title="You are on the list" role="status">Thanks for confirming. I will mail you when there is a spot to test.</Banner>}
      {confirmed === "no" && <Banner kind="warn" title="That link does not work any more" role="alert">It was used already or is older than 7 days. Sign up again below and a fresh one comes right away.</Banner>}
      {draft.restored && <div class="form__draft">Your unsent draft was restored. <button type="button" class="f-linkbtn" onClick={draft.discard}>Start over</button></div>}
      <div class="form__row">
        <Field label="Email" required help="For the confirmation now and the invite later. Nothing else." error={errors.email}>
          {(id, invalid) => <Input id={id} invalid={invalid} type="email" autoComplete="email" required maxLength={LIMITS.email} value={s.email} onInput={(e) => set({ ...s, email: e.currentTarget.value })} />}
        </Field>
        <Field label="First name or nickname" error={errors.nickname}>
          {(id, invalid) => <Input id={id} invalid={invalid} autoComplete="given-name" maxLength={LIMITS.nickname} value={s.nickname} onInput={(e) => set({ ...s, nickname: e.currentTarget.value })} />}
        </Field>
      </div>
      <PersonFields value={s.person} onChange={(person) => set({ ...s, person })} errors={errors} />
      <div class="turnstile" ref={ts.ref} />
      {(errors.turnstile || errors.form || ts.failed) && <Banner kind="danger" title={errors.form ?? errors.turnstile ?? "The bot check could not load"} role="alert">{ts.failed && !errors.form ? "Reload the page and try again." : undefined}</Banner>}
      <div class="form__actions">
        <Button type="submit" size="lg" loading={busy}>Join the waiting list</Button>
        <span class="form__fine">Double opt-in: nothing is kept until you confirm. <a href="/privacy">Privacy</a></span>
      </div>
    </form>
  );
}
