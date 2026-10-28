# @openclapper/home-ui

The design system of openclapper.org: a copy of the tokens and component CSS of `packages/ui` in
[OpenClapper core](https://github.com/OpenClapper-dev/core) (`src/design/*.css`, copied 2026-10-28 from
core v0.14.3, unchanged), plus the few Preact components this site needs. The components are this
package's own: the core ones depend on the app vocabulary and the icon font, neither of which belongs
on a public page.

When the tokens change in core, copy the CSS files again and note the version here. Once a second
consumer appears (the forum), the plan is to publish core's `@openclapper/ui` and depend on it instead.
