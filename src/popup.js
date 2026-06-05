import { h, render } from "preact";
import { setup } from "goober";
import { App } from "./App.jsx";

setup(h);

render(h(App, null), document.getElementById("appRoot"));
