import { chromium } from "playwright";
import { mkdir, mkdtemp, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Uso: npm run screenshots
// Carga el build de Chrome (build/chrome) en Chromium, recorre las vistas del popup
// y guarda las capturas del README en static/.
// Variables opcionales:
//   CHROMIUM_PATH: ejecutable de Chromium a usar en lugar del que instala Playwright.
//   SCREENSHOTS_OUT: carpeta de salida (por defecto static/).

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");
const extensionDir = path.join(root, "build", "chrome");
const outDir = path.resolve(root, process.env.SCREENSHOTS_OUT || "static");

const POPUP_WIDTH = 360;
const DEVICE_SCALE_FACTOR = 2;
const SETTLE_MS = 500;

try {
  await stat(path.join(extensionDir, "manifest.json"));
} catch {
  console.error("[screenshots] No existe build/chrome. Ejecuta antes: npm run build:chrome");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
const profileDir = await mkdtemp(path.join(os.tmpdir(), "proxyxt-screenshots-"));

// Las extensiones solo cargan con el Chromium completo (no con headless shell).
const context = await chromium.launchPersistentContext(profileDir, {
  headless: true,
  channel: "chromium",
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: [
    `--disable-extensions-except=${extensionDir}`,
    `--load-extension=${extensionDir}`,
    "--lang=es-ES"
  ],
  locale: "es-ES",
  viewport: { width: POPUP_WIDTH, height: 600 },
  deviceScaleFactor: DEVICE_SCALE_FACTOR
});

try {
  const serviceWorker = context.serviceWorkers()[0] || (await context.waitForEvent("serviceworker"));
  const extensionId = new URL(serviceWorker.url()).host;

  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.locator("header button").first().waitFor();

  const capture = async (name) => {
    await page.waitForTimeout(SETTLE_MS);
    const height = await page.evaluate(() =>
      Math.ceil(document.getElementById("appRoot").getBoundingClientRect().height)
    );
    await page.setViewportSize({ width: POPUP_WIDTH, height });
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file });
    console.log(`[screenshots] ${path.relative(root, file)} (${POPUP_WIDTH}x${height})`);
  };

  // Vista principal sin servidores.
  await capture("home");

  // Alta de servidor.
  await page.locator("header button").last().click();
  await page.fill("#host", "192.168.1.1");
  await page.fill("#port", "1234");
  await page.fill("#name", "Home");
  await capture("server-add");

  // Servidor activo.
  await page.locator("form button[type=submit]").first().click();
  await page.locator("li button").first().click();
  await capture("home-server-selected");

  // Preferencias.
  await page.locator("header button").first().click();
  await capture("preferences");

  // Logs del backend.
  await page.locator("footer button").first().click();
  await capture("logs");
} finally {
  await context.close();
  await rm(profileDir, { recursive: true, force: true });
}
