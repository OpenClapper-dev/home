import { render } from "preact";
import "@openclapper/home-ui";
import "../site.css";
import "./admin.css";
import { Admin } from "./Admin.tsx";

render(<Admin />, document.getElementById("app")!);
