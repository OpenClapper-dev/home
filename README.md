# OpenClapper home

[openclapper.org](https://openclapper.org): the project's public page, the sign-up (the tester waiting
list and the Call Sheet, one mail whenever the plan moves a step) and the feature-request form. The
experimental code lives in [OpenClapper-dev/core](https://github.com/OpenClapper-dev/core); this repository
is the community side and will grow the forum, job board and whatever else is not the app.

One Cloudflare Worker serves the static page, the forms' API and the owner's admin view (behind
Cloudflare Access). Submissions go to D1; the sign-up's confirmation mail goes through Cloudflare Email Service. [docs/](docs/README.md) has the details.

```sh
make init    # once: local dev files, Worker types, local D1 schema
make dev     # Worker on :8790 and the page on :5180 (admin at /admin/, no sign-in locally)
make check   # what CI runs: lint, typecheck, tests, build dry runs
```

Open source under the [Apache License 2.0](LICENSE).
