import { h, render } from "preact";
import { setup } from "goober";
import { App } from "./App.jsx";

setup(h);

const root = document.getElementById("appRoot");

if (root && !globalThis.__proxyxtPopupMounted) {
	// Defensive reset in case the same document is initialized more than once.
	root.replaceChildren();
	render(h(App, null), root);
	globalThis.__proxyxtPopupMounted = true;
}
