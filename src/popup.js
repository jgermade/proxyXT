import { h, render } from "preact";
import { setup } from "goober";
import { App } from "./App.jsx";

setup(h);

const root = document.getElementById("appRoot");
const mountId = "proxyxtPopupMount";

if (root) {
	let mountNode = document.getElementById(mountId);

	if (!mountNode || mountNode.parentElement !== root) {
		mountNode = document.createElement("div");
		mountNode.id = mountId;
		root.replaceChildren(mountNode);
	} else {
		root.replaceChildren(mountNode);
		mountNode.replaceChildren();
	}

	render(h(App, null), mountNode);
}
