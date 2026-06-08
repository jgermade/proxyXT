import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { load as parseYaml } from "js-yaml";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const messagesDir = path.resolve(__dirname, "..", "messages");
const referenceFileName = "en.yml";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function collectLeafPaths(value, prefix = "") {
  if (!isPlainObject(value)) {
    return prefix ? [prefix] : [];
  }

  const keys = Object.keys(value);
  if (keys.length === 0) {
    return prefix ? [prefix] : [];
  }

  return keys.flatMap((key) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return collectLeafPaths(value[key], nextPrefix);
  });
}

function getByPath(obj, keyPath) {
  return String(keyPath)
    .split(".")
    .reduce((current, segment) => {
      if (!isPlainObject(current) || !(segment in current)) {
        return undefined;
      }
      return current[segment];
    }, obj);
}

function extractPlaceholders(text) {
  if (typeof text !== "string") {
    return [];
  }

  const matches = new Set();
  const regex = /\{\{\s*([\w.-]+)\s*\}\}/g;
  let result = regex.exec(text);
  while (result) {
    matches.add(result[1]);
    result = regex.exec(text);
  }
  return [...matches].sort((a, b) => a.localeCompare(b));
}

function formatList(list) {
  return list.map((item) => `  - ${item}`).join("\n");
}

function formatPlaceholderDiffs(diffs) {
  return diffs
    .map(({ key, expected, actual }) => `  - ${key}: expected [${expected.join(", ")}], got [${actual.join(", ")}]`)
    .join("\n");
}

async function loadYamlFile(filePath) {
  const raw = await readFile(filePath, "utf8");
  const parsed = parseYaml(raw);
  if (!isPlainObject(parsed)) {
    throw new Error(`Expected a YAML object at root in ${path.basename(filePath)}`);
  }
  return parsed;
}

async function main() {
  const entries = await readdir(messagesDir, { withFileTypes: true });
  const messageFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".yml"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  if (!messageFiles.includes(referenceFileName)) {
    throw new Error(`Reference file ${referenceFileName} was not found in messages/`);
  }

  if (messageFiles.length < 2) {
    console.log("[check-message-keys] Nothing to compare (only one messages file found).");
    return;
  }

  const referencePath = path.join(messagesDir, referenceFileName);
  const referenceYaml = await loadYamlFile(referencePath);
  const referenceKeys = collectLeafPaths(referenceYaml).sort((a, b) => a.localeCompare(b));
  const referenceSet = new Set(referenceKeys);

  const errors = [];

  for (const fileName of messageFiles) {
    if (fileName === referenceFileName) {
      continue;
    }

    const filePath = path.join(messagesDir, fileName);
    const yaml = await loadYamlFile(filePath);
    const keys = collectLeafPaths(yaml).sort((a, b) => a.localeCompare(b));
    const keySet = new Set(keys);

    const missing = referenceKeys.filter((key) => !keySet.has(key));
    const extra = keys.filter((key) => !referenceSet.has(key));
    const placeholderDiffs = [];

    for (const key of referenceKeys) {
      if (!keySet.has(key)) {
        continue;
      }

      const referenceValue = getByPath(referenceYaml, key);
      const targetValue = getByPath(yaml, key);

      if (typeof referenceValue !== "string" || typeof targetValue !== "string") {
        continue;
      }

      const expected = extractPlaceholders(referenceValue);
      const actual = extractPlaceholders(targetValue);
      const areEqual = expected.length === actual.length && expected.every((item, index) => item === actual[index]);

      if (!areEqual) {
        placeholderDiffs.push({ key, expected, actual });
      }
    }

    if (missing.length > 0 || extra.length > 0 || placeholderDiffs.length > 0) {
      const chunks = [`[check-message-keys] ${fileName} does not match ${referenceFileName}.`];
      if (missing.length > 0) {
        chunks.push("Missing keys:", formatList(missing));
      }
      if (extra.length > 0) {
        chunks.push("Extra keys:", formatList(extra));
      }
      if (placeholderDiffs.length > 0) {
        chunks.push("Placeholder mismatch:", formatPlaceholderDiffs(placeholderDiffs));
      }
      errors.push(chunks.join("\n"));
    }
  }

  if (errors.length > 0) {
    console.error(errors.join("\n\n"));
    process.exitCode = 1;
    return;
  }

  console.log(`[check-message-keys] OK: ${messageFiles.length} message files share the same keys.`);
}

main().catch((error) => {
  console.error(`[check-message-keys] ${error.message}`);
  process.exitCode = 1;
});
