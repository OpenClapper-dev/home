# Deploying

The owner deploys from GitHub Actions: **Actions → Deploy → Run workflow**, environment `production`.
The workflow migrates D1, builds the page with the production Turnstile site key, deploys the Worker on
the custom domain and sets the Turnstile secret. Everything comes from the GitHub environment.

## One-time setup on Cloudflare

1. **Zone**: `openclapper.org` in the account.
2. **API token** (`CLOUDFLARE_API_TOKEN`): Workers Scripts: Edit, D1: Edit, Workers Routes: Edit (custom domain), Zone DNS: Edit for the zone, Account Settings: Read.
3. **Email Service**: Compute & AI → Email Service → Onboard Domain → `openclapper.org`, add the SPF and DKIM records it shows. Or `npx wrangler email sending enable openclapper.org`. Sending to arbitrary addresses needs the Workers Paid plan (3,000 mails per month included).
4. **Turnstile**: Turnstile → Add widget, hostnames `openclapper.org`, managed mode. Note the site key (a variable) and the secret (a secret).
5. **Access application** for `/admin`: Zero Trust → Access → Applications → Self-hosted, domain `openclapper.org`, path `admin`; a policy allowing only your login. Note the application's **Audience (AUD) tag** and your **team domain** (`<team>.cloudflareaccess.com`). The application can be created before or after the first deploy; until both variables are set, `/admin` refuses every request.

## The `production` environment

| Name | Kind | Value |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | secret | the token above |
| `CLOUDFLARE_ACCOUNT_ID` | secret | the account id |
| `TURNSTILE_SECRET` | secret | the widget's secret key |
| `TURNSTILE_SITEKEY` | variable | the widget's site key |
| `SITE_DOMAIN` | variable | `openclapper.org` |
| `ACCESS_TEAM_DOMAIN` | variable | `<team>.cloudflareaccess.com` |
| `ACCESS_AUD` | variable | the admin application's AUD |
| `D1_DATABASE_ID` | variable | optional: the first run creates `openclapper-home` and finds it by name afterwards |
| `D1_DATABASE_NAME`, `D1_LOCATION`, `WORKER_NAME`, `SITE_URL`, `MAIL_FROM` | variable | optional, see `scripts/deploy-config.mjs` for the defaults |

`MAIL_FROM` defaults to `OpenClapper <noreply@openclapper.org>`; the privacy page names `hello@openclapper.org` for data requests, which needs an Email Routing rule on the zone to reach you.

## Afterwards

- The page: `https://openclapper.org/`. The admin view: `https://openclapper.org/admin/` (through Access).
- Send yourself a waiting-list sign-up and open the link; the first sends from a new account are rate-limited while its reputation builds.
- Rotate the Turnstile secret by changing the environment secret and running Deploy again.
