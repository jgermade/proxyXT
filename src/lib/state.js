export const defaultState = {
  activeServerId: null,
  servers: [],
  userColorPresets: [],
  preferences: {
    autoFailoverEnabled: false,
    language: "auto",
    reloadActiveTabOnToggle: false,
    syncServersWithAccount: false
  }
};

export const DEFAULT_SELECTION_COLOR = "#FF5400";

function normalizeColorHex(color) {
  const value = String(color || "").trim().toUpperCase();
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(value) ? value : null;
}

function normalizeUserColorPresets(colors) {
  if (!Array.isArray(colors)) {
    return [];
  }

  const seen = new Set();
  const normalized = [];
  for (const color of colors) {
    const value = normalizeColorHex(color);
    if (!value || seen.has(value)) {
      continue;
    }
    seen.add(value);
    normalized.push(value);
  }
  return normalized;
}

export const initialFormState = {
  id: "",
  name: "",
  scheme: "http",
  host: "",
  port: "",
  bypassList: "",
  selectionColor: DEFAULT_SELECTION_COLOR
};

export function normalizeServer(server) {
  const selectionColor = String(server?.selectionColor || DEFAULT_SELECTION_COLOR).trim().toUpperCase();
  return {
    id: server?.id || "",
    name: String(server?.name || "").trim(),
    scheme: String(server?.scheme || "http").trim().toLowerCase(),
    host: String(server?.host || "").trim(),
    port: String(server?.port || "").trim(),
    bypassList: String(server?.bypassList || "").trim(),
    selectionColor: /^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(selectionColor) ? selectionColor : DEFAULT_SELECTION_COLOR
  };
}

export function normalizeState(state) {
  const normalizedServers = Array.isArray(state?.servers) ? state.servers.map((server) => normalizeServer(server)) : [];
  const normalizedUserColorPresets = normalizeUserColorPresets(state?.userColorPresets);
  return {
    ...defaultState,
    ...(state || {}),
    servers: normalizedServers,
    userColorPresets: normalizedUserColorPresets,
    preferences: {
      ...defaultState.preferences,
      ...(state?.preferences || {})
    }
  };
}

export function getServerDisplayName(server) {
  const alias = String(server?.name || "").trim();
  if (alias) {
    return alias;
  }
  return `${server.host}:${server.port}`;
}
