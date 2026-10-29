/**
 * The one mail this site sends: the waiting list's confirmation link, through Cloudflare Email
 * Service (the `send_email` binding; the domain of MAIL_FROM must be onboarded on the account).
 * Text and HTML both, as the service recommends; no tracking, no images.
 */
export interface Mailer {
  send(message: { to: string; from: string; subject: string; text: string; html: string }): Promise<unknown>;
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendConfirmation(mailer: Mailer, env: { MAIL_FROM: string; SITE_URL: string }, to: string, token: string): Promise<void> {
  const link = `${env.SITE_URL.replace(/\/$/, "")}/api/waitlist/confirm/${token}`;
  const text = [
    "Thanks for your interest in OpenClapper.",
    "",
    "Please confirm your email address to join the tester waiting list:",
    link,
    "",
    "The link works for 7 days. If you did not sign up, ignore this mail: nothing is kept without a confirmation.",
    "",
    "openclapper.org",
  ].join("\n");
  const html = `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0B0B0C">
<p>Thanks for your interest in OpenClapper.</p>
<p>Please confirm your email address to join the tester waiting list:</p>
<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 16px;background:#0040D8;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">Confirm my email</a></p>
<p style="color:#46464C;font-size:14px">Or open this link: <a href="${escapeHtml(link)}">${escapeHtml(link)}</a></p>
<p style="color:#46464C;font-size:14px">The link works for 7 days. If you did not sign up, ignore this mail: nothing is kept without a confirmation.</p>
<p style="color:#46464C;font-size:14px">openclapper.org</p>
</body></html>`;
  await mailer.send({ to, from: env.MAIL_FROM, subject: "Confirm your email for the OpenClapper waiting list", text, html });
}
