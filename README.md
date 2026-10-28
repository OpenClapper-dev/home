# OpenClapper home

[openclapper.org](https://openclapper.org): the project's public page, the tester waiting list and
the feature-request form. The app itself lives in [OpenClapper-dev/core](https://github.com/OpenClapper-dev/core);
this repository is the community side and will grow the forum, job board and whatever else is not the app.

One Cloudflare Worker serves the static page, the forms' API and the owner's admin view (behind
Cloudflare Access). Submissions go to D1; the waiting list's confirmation mail goes through Cloudflare
Email Service. [docs/](docs/README.md) has the details.

```sh
make init    # once: local dev files, Worker types, local D1 schema
make dev     # Worker on :8787 and the page on :5173 (admin at /admin/, no sign-in locally)
make check   # what CI runs: lint, typecheck, tests, build dry runs
```

Open source under the [Apache License 2.0](LICENSE).
