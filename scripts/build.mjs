import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");
const distDir = path.join(root, "dist");

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const manifestTemplate = yaml.load(await readFile(path.join(srcDir, "manifest.yml"), "utf8"));
const manifest = {
  ...manifestTemplate,
  version: packageJson.version
};

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await build({
  entryPoints: {
    popup: path.join(srcDir, "popup.js"),
    logs: path.join(srcDir, "logs.jsx"),
    background: path.join(srcDir, "background.js")
  },
  outdir: distDir,
  entryNames: "[name]",
  bundle: true,
  format: "esm",
  target: "es2020",
  jsxFactory: "h",
  jsxFragment: "Fragment",
  alias: {
    react: "preact/compat",
    "react-dom": "preact/compat",
    "react-dom/test-utils": "preact/test-utils",
    "react/jsx-runtime": "preact/jsx-runtime"
  },
  loader: {
    ".js": "js",
    ".jsx": "jsx",
    ".yml": "text"
  }
});

const staticFiles = [
  "popup.html",
  "popup.css",
  "logs.html",
  "logs.css",
  "proxyxt.png",
  "proxyxt-off.png"
];

for (const fileName of staticFiles) {
  await cp(path.join(srcDir, fileName), path.join(distDir, fileName));
}

await writeFile(path.join(distDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

await cp(path.join(srcDir, "icons"), path.join(distDir, "icons"), { recursive: true });
