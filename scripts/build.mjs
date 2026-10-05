import { build } from "esbuild";
import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const srcDir = path.join(root, "src");

// Uso: node scripts/build.mjs [--target chrome|firefox]
// Sin target se genera el build combinado en dist/ (comportamiento original).
const targets = ["chrome", "firefox"];
const targetArgIndex = process.argv.indexOf("--target");
const target = targetArgIndex === -1 ? null : process.argv[targetArgIndex + 1];

if (targetArgIndex !== -1 && !targets.includes(target)) {
  console.error(`[build] Target no valido: ${target}. Usa uno de: ${targets.join(", ")}`);
  process.exit(1);
}

const distDir = target ? path.join(root, "build", target) : path.join(root, "dist");

const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const manifestTemplate = yaml.load(await readFile(path.join(srcDir, "manifest.yml"), "utf8"));
const manifest = {
  ...manifestTemplate,
  version: packageJson.version
};

if (target === "chrome") {
  // Chrome no reconoce browser_specific_settings y muestra un aviso al cargarla.
  delete manifest.browser_specific_settings;
}

if (target === "firefox") {
  // Firefox (MV3) no soporta background.service_worker; usa background.scripts.
  manifest.background = { scripts: [manifestTemplate.background.service_worker] };
}

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
