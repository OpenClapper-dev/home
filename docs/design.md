# Design

The site uses OpenClapper's design system so it looks like the apps: the Atkinson Hyperlegible Next
face, the Sun (light) and Set (dark) themes, the same tokens, buttons, fields, chips and banners.

`packages/ui/src/design/*.css` is a **verbatim copy** of core's `packages/ui/src/design` files that
the site needs (colors, typography, spacing, actions, forms, feedback, navigation); its README says
which version. Change tokens in core and copy them again; never edit the copies. `base.css` and the
components in `components.tsx` are this repository's own: the core components depend on the app
vocabulary and the icon font, which a public page does not want. Icons here are a handful of inline
SVG paths from Material Design Icons.

Rules that carry over from core: plain CSS on the tokens, never hard-coded colours; both themes stay
high contrast; selected state is never colour alone (chips show a check, tabs go bold); every
interactive element has a visible focus ring.

The plan once a second consumer exists (the forum): publish core's `@openclapper/ui` and depend on it.
