import { render } from "preact";
// The design system (tokens, component classes, components), copied from core's packages/ui.
import "@openclapper/home-ui";
import "./site.css";
import { Page } from "./Page.tsx";

render(<Page />, document.getElementById("app")!);
