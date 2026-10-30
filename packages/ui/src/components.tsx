/** The components the site uses, on the design-system classes (actions.css, forms.css, feedback.css). */
import type { ComponentChildren, JSX } from "preact";
import { useEffect, useId, useRef } from "preact/hooks";

export const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

/** Material Design Icons paths (Apache 2.0), inline so the page loads no icon font. */
const PATHS = {
  check: "M21 7L9 19l-5.5-5.5 1.41-1.41L9 16.17 19.59 5.59z",
  "alert-circle": "M13 13h-2V7h2m0 10h-2v-2h2M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z",
  "check-circle": "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z",
  information: "M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2z",
  plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z",
  delete: "M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z",
  close: "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
  sun: "M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0-5 2.39 3.42C13.65 5.15 12.84 5 12 5s-1.65.15-2.39.42zM3.34 7l4.16-.35A7.2 7.2 0 0 0 5.94 8.5c-.44.74-.69 1.5-.83 2.29zm.02 10 1.76-3.77a7.1 7.1 0 0 0 .84 2.27c.42.74.96 1.35 1.56 1.86zM20.65 7l-1.77 3.79a7.02 7.02 0 0 0-.84-2.29 7.2 7.2 0 0 0-1.56-1.85zm-.01 10-4.14.36c.59-.51 1.12-1.14 1.54-1.86.42-.73.69-1.5.83-2.27zM12 22l-2.41-3.44c.74.27 1.55.44 2.41.44.82 0 1.63-.17 2.37-.44z",
  moon: "M17.75 4.09 15.22 6.03l.91 3.06-2.57-1.84-2.57 1.84.91-3.06-2.53-1.94L12.44 4l1.06-3 1.06 3zm3.5 6.91-1.64 1.25.59 1.98-1.65-1.19-1.66 1.19.59-1.98L15.84 11l2.06-.05L18.5 9l.71 1.95zM9.5 17c-1.1 0-2.08-.3-2.95-.78a8 8 0 0 1 .09-11.72 8 8 0 1 0 8.93 10.53A5.98 5.98 0 0 1 9.5 17z",
  "theme-auto": "M7.5 2c-1.79 1.15-3 3.18-3 5.5s1.21 4.35 3.03 5.5C4.46 13 2 10.54 2 7.5A5.5 5.5 0 0 1 7.5 2m11.57 1.5 1.43 1.43L4.93 20.5 3.5 19.07zm-6.18 2.43L11.41 5 9.97 6l.42-1.7L9 3.24l1.75-.12.58-1.65L12 3.1l1.73.03-1.35 1.13zm-3.3 3.61-1.16-.73-1.12.78.34-1.32-1.09-.83 1.36-.09.45-1.29.51 1.27 1.36.03-1.05.87zM19 13.5a5.5 5.5 0 0 1-5.5 5.5c-1.22 0-2.35-.4-3.26-1.07l7.69-7.69c.67.91 1.07 2.04 1.07 3.26m-4.4 6.58 2.77-1.15-.24 3.35zm4.33-2.7 1.15-2.77 2.2 2.54zm1.15-4.96-1.14-2.78 3.34.24zM9.63 18.93l2.77 1.15-2.53 2.19z",
  github: "M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z",
  "arrow-down": "M11 4h2v12l5.5-5.5 1.42 1.42L12 19.84l-7.92-7.92L5.5 10.5 11 16z",
  "open-in-new": "M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z",
  download: "M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7z",
  minus: "M19 13H5v-2h14z",
  translate: "m12.87 15.07-2.54-2.51.03-.03A17.52 17.52 0 0 0 14.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2zm-2.62 7 1.62-4.33L19.12 17z",
} as const;
export type IconName = keyof typeof PATHS;

export function Icon({ name, class: extra }: { name: IconName; class?: string }) {
  return <svg class={cx("f-svg", extra)} viewBox="0 0 24 24" aria-hidden="true"><path d={PATHS[name]} /></svg>;
}

type Kind = "primary" | "secondary" | "ghost" | "danger" | "approve";
const KIND_CLASS: Record<Kind, string | false> = { primary: false, secondary: "f-btn--secondary", ghost: "f-btn--ghost", danger: "f-btn--danger", approve: "f-btn--approve" };

export function Button({ kind = "primary", size, icon, loading, block, class: extra, children, type = "button", ...rest }:
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "icon"> & { kind?: Kind; size?: "sm" | "lg"; icon?: IconName; loading?: boolean; block?: boolean }) {
  return (
    <button type={type} {...rest} disabled={rest.disabled || loading} class={cx("f-btn", KIND_CLASS[kind], size && `f-btn--${size}`, block && "f-btn--block", loading && "is-loading", extra as string)}>
      {loading ? <span class="f-spinner" /> : icon && <Icon name={icon} />}
      {children}
    </button>
  );
}

/** A link styled as a button (the hero's calls to action). */
export function LinkButton({ kind = "primary", size, icon, class: extra, children, ...rest }: JSX.AnchorHTMLAttributes<HTMLAnchorElement> & { kind?: Kind; size?: "sm" | "lg"; icon?: IconName }) {
  return <a {...rest} class={cx("f-btn", KIND_CLASS[kind], size && `f-btn--${size}`, extra as string)}>{icon && <Icon name={icon} />}{children}</a>;
}

export function IconButton({ icon, label, kind = "ghost", size, class: extra, ...rest }: Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "size" | "icon"> & { icon: IconName; label: string; kind?: Kind; size?: "sm" }) {
  return <button type="button" aria-label={label} title={label} {...rest} class={cx("f-btn", "f-btn--icon", KIND_CLASS[kind], size && `f-btn--${size}`, extra as string)}><Icon name={icon} /></button>;
}

/** Label, control, help and error in one column. The child gets the label's id to point at. */
export function Field({ label, required, help, error, optional = "optional", children }: { label: string; required?: boolean; help?: ComponentChildren; error?: string | null; optional?: string; children: (id: string, invalid: boolean) => ComponentChildren }) {
  const id = useId();
  return (
    <div class="f-field">
      <label class="f-field__label" for={id}>{label}{required && <span class="f-req" aria-hidden="true"> *</span>}{!required && <span class="meta"> · {optional}</span>}</label>
      {children(id, !!error)}
      {help && !error && <div class="f-field__help">{help}</div>}
      {error && <div class="f-field__error" role="alert"><Icon name="alert-circle" />{error}</div>}
    </div>
  );
}

export function Input({ invalid, size, class: extra, ...rest }: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size"> & { invalid?: boolean; size?: "lg" }) {
  return <span class={cx("f-input", invalid && "is-error", size && `f-input--${size}`, rest.disabled && "is-disabled", extra as string)}><input {...rest} aria-invalid={invalid || undefined} /></span>;
}

export function Textarea({ invalid, class: extra, ...rest }: JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return <textarea {...rest} aria-invalid={invalid || undefined} class={cx("f-textarea", invalid && "is-error", extra as string)} />;
}

export function Chip({ selected, children, ...rest }: JSX.ButtonHTMLAttributes<HTMLButtonElement> & { selected: boolean }) {
  return <button type="button" aria-pressed={selected} {...rest} class="f-chip">{selected && <Icon name="check" />}{children}</button>;
}

export function Check({ checked, indeterminate, onChange, children, disabled }: { checked: boolean; indeterminate?: boolean; onChange: (v: boolean) => void; children: ComponentChildren; disabled?: boolean }) {
  return (
    <button type="button" role="checkbox" aria-checked={indeterminate ? "mixed" : checked} disabled={disabled} onClick={() => onChange(indeterminate ? true : !checked)}
      class={cx("f-check", checked && !indeterminate && "is-checked", indeterminate && "is-indeterminate", disabled && "is-disabled")}>
      <span class="f-check__box">{indeterminate ? <Icon name="minus" /> : checked && <Icon name="check" />}</span>
      <span>{children}</span>
    </button>
  );
}

export function Banner({ kind, icon, title, children, action, role }: { kind: "ok" | "info" | "warn" | "danger"; icon?: IconName; title: string; children?: ComponentChildren; action?: ComponentChildren; role?: "alert" | "status" }) {
  const def: Record<typeof kind, IconName> = { ok: "check-circle", info: "information", warn: "alert-circle", danger: "alert-circle" };
  return (
    <div class={cx("f-banner", `f-banner--${kind}`)} role={role}>
      <Icon name={icon ?? def[kind]} />
      <div class="f-banner__text"><div class="f-banner__title">{title}</div>{children && <div class="f-banner__meta">{children}</div>}</div>
      {action}
    </div>
  );
}

export function Spinner({ size }: { size?: "lg" }) {
  return <span class={cx("f-spinner", size && "f-spinner--lg")} role="status" aria-label="Loading" />;
}

/** A modal on the native <dialog>: Escape and the close button close it; the scrim is the backdrop. */
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ComponentChildren }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} class="f-modal" onClose={onClose} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} aria-labelledby="modal-title">
      <div class="f-modal__head"><h2 class="f-modal__title" id="modal-title">{title}</h2><IconButton icon="close" label="Close" onClick={onClose} /></div>
      <div class="f-modal__body">{children}</div>
    </dialog>
  );
}
