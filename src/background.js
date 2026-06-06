const api = globalThis.browser ?? globalThis.chrome;

const STORAGE_KEY = "proxyxt-state";
const SYNC_SERVERS_KEY = "proxyxt-sync-servers";
const LOGS_KEY = "proxyxt-logs";
const MAX_LOGS = 200;
const FAILOVER_COOLDOWN_MS = 5000;
const FAILOVER_ERRORS_BEFORE_SWITCH = 3;
const FAILOVER_ERROR_ACCUMULATION_WINDOW_MS = 20000;
const DEFAULT_SELECTION_COLOR = "#FF5400";
const MAX_USER_COLOR_PRESETS = 32;
const CONNECTIVITY_CHECK_COOLDOWN_MS = 4000;
const CONNECTIVITY_CHECK_TIMEOUT_MS = 3500;
const CONNECTIVITY_CHECK_URL = "https://clients3.google.com/generate_204";
const ACTIVE_ICON_PATHS = {
  16: "icons/proxyxt-16.png",
  32: "icons/proxyxt-32.png",
  48: "icons/proxyxt-48.png",
  128: "icons/proxyxt-128.png"
};
const INACTIVE_ICON_PATHS = {
  16: "icons/proxyxt-16-bw.png",
  32: "icons/proxyxt-32-bw.png",
  48: "icons/proxyxt-48-bw.png",
  128: "icons/proxyxt-128-bw.png"
};
const ICON_SIZES = [16, 32, 48, 128];

const logoBitmapCache = new Map();
const dynamicIconCache = new Map();

const defaultState = {
  activeServerId: null,
  servers: [],
  userColorPresets: [],
  footerStatus: {
    connectionFailure: null,
    activeError: null
  },
  preferences: {
    autoFailoverEnabled: false,
    language: "auto",
    reloadActiveTabOnToggle: false,
    syncServersWithAccount: false
  }
};

let failoverInProgress = false;
let lastFailoverAt = 0;
let lastConnectivityCheckAt = 0;
let consecutiveProxyErrors = 0;
let lastProxyErrorAt = 0;

function resetProxyErrorStreak() {
  consecutiveProxyErrors = 0;
  lastProxyErrorAt = 0;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function broadcastStateUpdate(state) {
  if (!api.runtime?.sendMessage) {
    return;
  }

  try {
    if (api.runtime.sendMessage.length <= 1) {
      await api.runtime.sendMessage({ type: "proxyxt/stateUpdated", state });
      return;
    }

    await new Promise((resolve) => {
      api.runtime.sendMessage({ type: "proxyxt/stateUpdated", state }, () => {
        resolve();
      });
    });
  } catch (_error) {
    // Ignore broadcast failures when no UI listeners are attached.
  }
}

function storageGet(key) {
  if (api.storage?.local?.get.length <= 1) {
    return api.storage.local.get(key);
  }

  return new Promise((resolve, reject) => {
    api.storage.local.get(key, (result) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(result);
    });
  });
}

function storageSet(value) {
  if (api.storage?.local?.set.length <= 1) {
    return api.storage.local.set(value);
  }

  return new Promise((resolve, reject) => {
    api.storage.local.set(value, () => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function storageSyncGet(key) {
  if (!api.storage?.sync?.get) {
    return Promise.resolve({});
  }

  if (api.storage.sync.get.length <= 1) {
    return api.storage.sync.get(key);
  }

  return new Promise((resolve, reject) => {
    api.storage.sync.get(key, (result) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(result);
    });
  });
}

function storageSyncSet(value) {
  if (!api.storage?.sync?.set) {
    return Promise.resolve();
  }

  if (api.storage.sync.set.length <= 1) {
    return api.storage.sync.set(value);
  }

  return new Promise((resolve, reject) => {
    api.storage.sync.set(value, () => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function tabsQuery(queryInfo) {
  if (!api.tabs?.query) {
    return Promise.resolve([]);
  }

  if (api.tabs.query.length <= 1) {
    return api.tabs.query(queryInfo);
  }

  return new Promise((resolve, reject) => {
    api.tabs.query(queryInfo, (tabs) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(Array.isArray(tabs) ? tabs : []);
    });
  });
}

function tabsReload(tabId) {
  if (!api.tabs?.reload || tabId === undefined || tabId === null) {
    return Promise.resolve();
  }

  if (api.tabs.reload.length <= 1) {
    return api.tabs.reload(tabId);
  }

  return new Promise((resolve, reject) => {
    api.tabs.reload(tabId, {}, () => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function proxySettingsSet(config) {
  if (api.proxy?.settings?.set.length <= 1) {
    return api.proxy.settings.set(config);
  }

  return new Promise((resolve, reject) => {
    api.proxy.settings.set(config, () => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function proxySettingsGet(details = { incognito: false }) {
  if (api.proxy?.settings?.get.length <= 1) {
    return api.proxy.settings.get(details);
  }

  return new Promise((resolve, reject) => {
    api.proxy.settings.get(details, (result) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(result);
    });
  });
}

async function loadState() {
  const result = await storageGet(STORAGE_KEY);
  const state = result?.[STORAGE_KEY];
  if (!state) {
    return { ...defaultState };
  }

  return {
    ...defaultState,
    ...state,
    servers: Array.isArray(state.servers) ? state.servers : [],
    userColorPresets: sanitizeUserColorPresets(state.userColorPresets),
    footerStatus: {
      ...defaultState.footerStatus,
      ...(state.footerStatus || {})
    },
    preferences: {
      ...defaultState.preferences,
      ...(state.preferences || {})
    }
  };
}

async function saveState(state) {
  await storageSet({ [STORAGE_KEY]: state });
}

async function loadLogs() {
  const result = await storageGet(LOGS_KEY);
  const logs = result?.[LOGS_KEY];
  return Array.isArray(logs) ? logs : [];
}

async function saveLogs(logs) {
  await storageSet({ [LOGS_KEY]: logs.slice(-MAX_LOGS) });
}

async function addLog(level, message, context) {
  const normalizedLevel = level === "warn" ? "warning" : level;
  const logs = await loadLogs();
  logs.push({
    time: new Date().toISOString(),
    level: normalizedLevel,
    message,
    context: context || null
  });
  await saveLogs(logs);
}

async function reloadCurrentActiveTab() {
  try {
    const tabs = await tabsQuery({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (!activeTab?.id) {
      return;
    }
    await tabsReload(activeTab.id);
    await addLog("debug", "Pestana activa recargada tras cambio de proxy", {
      tabId: activeTab.id
    });
  } catch (error) {
    await addLog("warn", "No se pudo recargar la pestana activa", {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

function getLogContext(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return { ...payload };
}

function summarizeServer(server) {
  if (!server) {
    return null;
  }

  return {
    id: server.id,
    name: server.name || null,
    scheme: server.scheme,
    host: server.host,
    port: server.port,
    hasBypass: Boolean(String(server.bypassList || "").trim())
  };
}

function summarizeProxyValue(value) {
  const mode = value?.mode || null;
  const singleProxy = value?.rules?.singleProxy || null;
  return {
    mode,
    singleProxy,
    bypassCount: Array.isArray(value?.rules?.bypassList) ? value.rules.bypassList.length : 0
  };
}

function sanitizeColorHex(color) {
  const normalized = String(color || "").trim().toUpperCase();
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(normalized) ? normalized : null;
}

function getContrastingTextColor(hexColor) {
  const value = String(hexColor || "").trim().replace("#", "");
  const expanded = value.length === 3
    ? value.split("").map((part) => `${part}${part}`).join("")
    : value;

  if (!/^[0-9A-Fa-f]{6}$/.test(expanded)) {
    return "#1a2530";
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? "#1a2530" : "#ffffff";
}

function sanitizeUserColorPresets(rawColors) {
  if (!Array.isArray(rawColors)) {
    return [];
  }

  const result = [];
  const seen = new Set();
  for (const rawColor of rawColors) {
    const color = sanitizeColorHex(rawColor);
    if (!color || seen.has(color)) {
      continue;
    }
    seen.add(color);
    result.push(color);
    if (result.length >= MAX_USER_COLOR_PRESETS) {
      break;
    }
  }
  return result;
}

function updateConnectionFailure(state, details) {
  const now = Date.now();
  const current = state.footerStatus?.connectionFailure || null;
  const lastAttemptAt = current ? Number(current.lastAttemptAt || current.startedAt || 0) : 0;
  const needsReset = !current || now - lastAttemptAt > FAILOVER_ERROR_ACCUMULATION_WINDOW_MS;

  state.footerStatus = {
    ...(state.footerStatus || defaultState.footerStatus),
    connectionFailure: needsReset
      ? {
          startedAt: now,
          attemptCount: 1,
          lastAttemptAt: now,
          lastError: details?.error == null ? null : String(details.error)
        }
      : {
          startedAt: Number(current.startedAt || now),
          attemptCount: Math.max(1, Number(current.attemptCount || 1) + 1),
          lastAttemptAt: now,
          lastError: details?.error == null ? null : String(details.error)
        }
  };

  return state;
}

function clearConnectionFailure(state) {
  if (!state.footerStatus?.connectionFailure) {
    return state;
  }

  state.footerStatus = {
    ...(state.footerStatus || defaultState.footerStatus),
    connectionFailure: null
  };

  return state;
}

function setFailoverError(state, details, previousServer, nextServer) {
  state.footerStatus = {
    ...(state.footerStatus || defaultState.footerStatus),
    connectionFailure: null,
    activeError: {
      id: generateId(),
      createdAt: Date.now(),
      previousServerId: previousServer?.id || null,
      nextServerId: nextServer?.id || null,
      error: details?.error == null ? null : String(details.error)
    }
  };

  return state;
}

async function handleDismissFooterError() {
  const state = await loadState();
  const hasActiveError = Boolean(state.footerStatus?.activeError);
  const hasConnectionFailure = Boolean(state.footerStatus?.connectionFailure);
  if (!hasActiveError && !hasConnectionFailure) {
    return state;
  }

  state.footerStatus = {
    ...(state.footerStatus || defaultState.footerStatus),
    activeError: null,
    connectionFailure: null
  };

  await saveState(state);
  await broadcastStateUpdate(state);
  await addLog("debug", "Aviso del footer descartado por el usuario", {
    hadActiveError: hasActiveError,
    hadConnectionFailure: hasConnectionFailure
  });
  return state;
}

async function updateActionIcon(isProxyActive) {
  const actionApi = api.action ?? api.browserAction;
  if (!actionApi?.setIcon) {
    return;
  }

  const path = ACTIVE_ICON_PATHS;

  try {
    await setActionIcon({ path });
  } catch (error) {
    await addLog("warn", "No se pudo actualizar icono de la extension", {
      isProxyActive,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

async function setActionIcon(details) {
  const actionApi = api.action ?? api.browserAction;
  if (!actionApi?.setIcon) {
    return;
  }

  if (actionApi.setIcon.length <= 1) {
    await actionApi.setIcon(details);
    return;
  }

  await new Promise((resolve, reject) => {
    actionApi.setIcon(details, () => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

function getCanvasContext(size) {
  if (typeof OffscreenCanvas !== "undefined") {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    return ctx ? { canvas, ctx } : null;
  }

  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    return ctx ? { canvas, ctx } : null;
  }

  return null;
}

function drawRoundedRect(ctx, size, color) {
  const radius = Math.max(2, Math.round(size * 0.18));
  const max = size;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(max - radius, 0);
  ctx.quadraticCurveTo(max, 0, max, radius);
  ctx.lineTo(max, max - radius);
  ctx.quadraticCurveTo(max, max, max - radius, max);
  ctx.lineTo(radius, max);
  ctx.quadraticCurveTo(0, max, 0, max - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

async function loadLogoBitmap(size) {
  const cacheKey = String(size);
  if (logoBitmapCache.has(cacheKey)) {
    return logoBitmapCache.get(cacheKey);
  }

  if (typeof createImageBitmap !== "function" || !api.runtime?.getURL) {
    return null;
  }

  const logoPath = INACTIVE_ICON_PATHS[size] || INACTIVE_ICON_PATHS[16];
  if (!logoPath) {
    return null;
  }

  const response = await fetch(api.runtime.getURL(logoPath));
  const blob = await response.blob();
  const bitmap = await createImageBitmap(blob);
  logoBitmapCache.set(cacheKey, bitmap);
  return bitmap;
}

async function createDynamicIconSet(activeColor) {
  const normalized = sanitizeColorHex(activeColor) || DEFAULT_SELECTION_COLOR;
  const logoColor = getContrastingTextColor(normalized) === "#ffffff" ? "#ffffff" : "#000000";
  const cacheKey = `${normalized}|${logoColor}`;

  if (dynamicIconCache.has(cacheKey)) {
    return dynamicIconCache.get(cacheKey);
  }

  const imageDataBySize = {};
  for (const size of ICON_SIZES) {
    const baseContext = getCanvasContext(size);
    if (!baseContext) {
      return null;
    }

    const { ctx: baseCtx } = baseContext;
    drawRoundedRect(baseCtx, size, normalized);

    const logoBitmap = await loadLogoBitmap(size);
    if (!logoBitmap) {
      return null;
    }

    const logoContext = getCanvasContext(size);
    if (!logoContext) {
      return null;
    }

    const { ctx: logoCtx } = logoContext;
    const logoInset = Math.max(1, Math.round(size * 0.12));
    const logoSize = Math.max(1, size - (logoInset * 2));
    logoCtx.imageSmoothingEnabled = true;
    logoCtx.drawImage(logoBitmap, logoInset, logoInset, logoSize, logoSize);
    logoCtx.globalCompositeOperation = "source-in";
    logoCtx.fillStyle = logoColor;
    logoCtx.fillRect(0, 0, size, size);
    logoCtx.globalCompositeOperation = "source-over";

    baseCtx.drawImage(logoContext.canvas, 0, 0);
    imageDataBySize[size] = baseCtx.getImageData(0, 0, size, size);
  }

  dynamicIconCache.set(cacheKey, imageDataBySize);
  return imageDataBySize;
}

async function updateActionIconForActiveServer(server) {
  const activeColor = sanitizeColorHex(server?.selectionColor) || DEFAULT_SELECTION_COLOR;

  try {
    const imageData = await createDynamicIconSet(activeColor);
    if (imageData) {
      await setActionIcon({ imageData });
      return;
    }
  } catch (error) {
    await addLog("warn", "No se pudo generar icono dinamico de la extension", {
      activeColor,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  await updateActionIcon(true);
}

function mapServerToProxyRules(server) {
  const port = Number.parseInt(server.port, 10);
  if (!server.host || Number.isNaN(port)) {
    throw new Error("Servidor proxy invalido");
  }

  return {
    mode: "fixed_servers",
    rules: {
      singleProxy: {
        scheme: server.scheme,
        host: server.host,
        port
      },
      bypassList: (server.bypassList || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    }
  };
}

async function applyActiveProxy(state) {
  const activeServer = state.servers.find((server) => server.id === state.activeServerId);

  if (!activeServer) {
    await addLog("info", "Aplicando modo sistema (sin servidor activo)", {
      activeServerId: state.activeServerId
    });
    await proxySettingsSet({ value: { mode: "system" }, scope: "regular" });
    const current = await proxySettingsGet({ incognito: false });
    await addLog("debug", "Proxy configurado en navegador", {
      requestedMode: "system",
      effectiveMode: current?.value?.mode || null,
      levelOfControl: current?.levelOfControl || null
    });
    await updateActionIcon(false);
    return;
  }

  const value = mapServerToProxyRules(activeServer);
  await addLog("info", "Aplicando servidor proxy activo", {
    activeServerId: state.activeServerId,
    server: summarizeServer(activeServer),
    proxy: summarizeProxyValue(value)
  });
  await proxySettingsSet({ value, scope: "regular" });
  const current = await proxySettingsGet({ incognito: false });
  await addLog("debug", "Proxy configurado en navegador", {
    requestedMode: value.mode,
    effectiveMode: current?.value?.mode || null,
    effectiveProxy: summarizeProxyValue(current?.value || null),
    levelOfControl: current?.levelOfControl || null
  });
  await updateActionIconForActiveServer(activeServer);
}

function sanitizeServer(rawServer) {
  const selectionColor = String(rawServer.selectionColor || DEFAULT_SELECTION_COLOR).trim().toUpperCase();
  const server = {
    id: rawServer.id || generateId(),
    name: String(rawServer.name || "").trim(),
    scheme: String(rawServer.scheme || "http").trim().toLowerCase(),
    host: String(rawServer.host || "").trim(),
    port: String(rawServer.port || "").trim(),
    bypassList: String(rawServer.bypassList || "").trim(),
    selectionColor: /^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(selectionColor) ? selectionColor : DEFAULT_SELECTION_COLOR
  };

  if (!server.host || !server.port) {
    throw new Error("Host y puerto son obligatorios");
  }

  if (!["http", "https", "socks4", "socks5"].includes(server.scheme)) {
    throw new Error("Esquema no soportado");
  }

  const port = Number.parseInt(server.port, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error("Puerto invalido");
  }

  return server;
}

async function pullServersFromSyncIfEnabled(state) {
  if (!state.preferences?.syncServersWithAccount || !api.storage?.sync) {
    if (state.preferences?.syncServersWithAccount && !api.storage?.sync) {
      await addLog("warning", "storage.sync no disponible; no se pueden recuperar servidores", null);
    }
    return state;
  }

  const result = await storageSyncGet([SYNC_SERVERS_KEY, STORAGE_KEY]);
  const syncedPayloadRaw = result?.[SYNC_SERVERS_KEY];
  const legacyState = result?.[STORAGE_KEY];
  const legacyServersRaw = Array.isArray(legacyState?.servers) ? legacyState.servers : null;
  const legacyColorsRaw = Array.isArray(legacyState?.userColorPresets) ? legacyState.userColorPresets : null;

  const syncedServersRaw = Array.isArray(syncedPayloadRaw)
    ? syncedPayloadRaw
    : Array.isArray(syncedPayloadRaw?.servers)
      ? syncedPayloadRaw.servers
      : null;
  const syncedColorsRaw = Array.isArray(syncedPayloadRaw?.userColorPresets)
    ? syncedPayloadRaw.userColorPresets
    : Array.isArray(syncedPayloadRaw?.userColors)
      ? syncedPayloadRaw.userColors
      : null;

  const sourceRaw = Array.isArray(syncedServersRaw)
    ? syncedServersRaw
    : Array.isArray(legacyServersRaw)
      ? legacyServersRaw
      : null;
  const sourceColorsRaw = Array.isArray(syncedColorsRaw)
    ? syncedColorsRaw
    : Array.isArray(legacyColorsRaw)
      ? legacyColorsRaw
      : null;

  if (!Array.isArray(sourceRaw) && !Array.isArray(sourceColorsRaw)) {
    await addLog("debug", "No hay servidores disponibles en storage.sync", null);
    return state;
  }

  const sourceServers = Array.isArray(sourceRaw) ? sourceRaw : state.servers;
  const syncedServers = [];
  const syncedUserColorPresets = sanitizeUserColorPresets(sourceColorsRaw || []);
  let skipped = 0;
  for (const raw of sourceServers) {
    try {
      syncedServers.push(sanitizeServer(raw));
    } catch (_error) {
      // Skip invalid synced entries instead of failing the whole sync process.
      skipped += 1;
    }
  }

  await addLog("debug", "Lectura de servidores desde storage.sync", {
    source: Array.isArray(syncedServersRaw) || Array.isArray(syncedColorsRaw) ? SYNC_SERVERS_KEY : STORAGE_KEY,
    received: sourceServers.length,
    valid: syncedServers.length,
    skipped,
    syncedUserColorPresets: syncedUserColorPresets.length
  });

  const localSnapshot = JSON.stringify(state.servers);
  const syncedSnapshot = JSON.stringify(syncedServers);
  const localUserColorsSnapshot = JSON.stringify(sanitizeUserColorPresets(state.userColorPresets));
  const syncedUserColorsSnapshot = JSON.stringify(syncedUserColorPresets);
  if (localSnapshot === syncedSnapshot && localUserColorsSnapshot === syncedUserColorsSnapshot) {
    return state;
  }

  const nextState = {
    ...state,
    servers: syncedServers,
    userColorPresets: syncedUserColorPresets,
    activeServerId: syncedServers.some((server) => server.id === state.activeServerId) ? state.activeServerId : null
  };

  await saveState(nextState);
  await addLog("info", "Servidores sincronizados desde la cuenta del navegador", {
    totalServers: nextState.servers.length,
    userColorPresets: nextState.userColorPresets.length
  });
  return nextState;
}

async function pushServersToSyncIfEnabled(state) {
  if (!state.preferences?.syncServersWithAccount || !api.storage?.sync) {
    return;
  }

  await storageSyncSet({
    [SYNC_SERVERS_KEY]: {
      servers: state.servers,
      userColorPresets: sanitizeUserColorPresets(state.userColorPresets)
    }
  });
}

async function handleGetState() {
  const state = await loadState();
  const syncedState = await pullServersFromSyncIfEnabled(state);

  if (syncedState.preferences?.autoFailoverEnabled && syncedState.activeServerId) {
    void probeProxyConnectivityAndFailoverIfNeeded();
  }

  return syncedState;
}

async function handleGetLogs() {
  return loadLogs();
}

async function handleClearLogs() {
  await saveLogs([]);
  return [];
}

async function handleSaveServer(payload) {
  const incoming = sanitizeServer(payload.server || {});
  const state = await loadState();

  const index = state.servers.findIndex((server) => server.id === incoming.id);
  if (index >= 0) {
    state.servers[index] = incoming;
  } else {
    state.servers.push(incoming);
  }

  await saveState(state);
  await pushServersToSyncIfEnabled(state);
  await addLog("debug", "Estado actualizado tras guardar servidor", {
    server: summarizeServer(incoming),
    totalServers: state.servers.length,
    activeServerId: state.activeServerId
  });
  return state;
}

async function handleReorderServers(payload) {
  const state = await loadState();
  const orderedServerIds = Array.isArray(payload?.serverIds) ? payload.serverIds : [];
  if (!orderedServerIds.length) {
    return state;
  }

  const serverMap = new Map(state.servers.map((server) => [server.id, server]));
  const reorderedServers = [];

  for (const serverId of orderedServerIds) {
    const server = serverMap.get(serverId);
    if (server) {
      reorderedServers.push(server);
      serverMap.delete(serverId);
    }
  }

  for (const server of state.servers) {
    if (serverMap.has(server.id)) {
      reorderedServers.push(server);
      serverMap.delete(server.id);
    }
  }

  state.servers = reorderedServers;
  await saveState(state);
  await pushServersToSyncIfEnabled(state);
  await addLog("debug", "Estado actualizado tras reordenar servidores", {
    totalServers: state.servers.length
  });
  return state;
}

async function handleUpdateUserColorPresets(payload) {
  const state = await loadState();
  state.userColorPresets = sanitizeUserColorPresets(payload?.userColorPresets || payload?.colors || []);
  await saveState(state);
  await pushServersToSyncIfEnabled(state);
  await addLog("debug", "Estado actualizado tras guardar colores personalizados", {
    userColorPresets: state.userColorPresets.length
  });
  return state;
}

async function handleDeleteServer(payload) {
  const serverId = payload.serverId;
  const state = await loadState();
  const deletedServer = state.servers.find((server) => server.id === serverId) || null;

  state.servers = state.servers.filter((server) => server.id !== serverId);
  if (state.activeServerId === serverId) {
    state.activeServerId = null;
  }

  await saveState(state);
  await pushServersToSyncIfEnabled(state);
  await applyActiveProxy(state);
  await addLog("debug", "Estado actualizado tras eliminar servidor", {
    serverId,
    deletedServer: summarizeServer(deletedServer),
    totalServers: state.servers.length,
    activeServerId: state.activeServerId
  });
  return state;
}

async function handleActivateServer(payload) {
  const state = await loadState();
  const serverId = payload.serverId;

  await addLog("debug", "Solicitud de cambio de servidor activo", {
    requestedServerId: serverId,
    previousActiveServerId: state.activeServerId
  });

  if (serverId === null) {
    state.activeServerId = null;
  } else {
    const exists = state.servers.some((server) => server.id === serverId);
    if (!exists) {
      throw new Error("Servidor no encontrado");
    }
    state.activeServerId = serverId;
  }

  await saveState(state);
  await applyActiveProxy(state);
  if (state.preferences?.reloadActiveTabOnToggle) {
    await reloadCurrentActiveTab();
  }
  await addLog("debug", "Estado actualizado tras activar/desactivar", {
    activeServerId: state.activeServerId
  });
  return state;
}

async function handleUpdatePreferences(payload) {
  const state = await loadState();
  const incoming = payload?.preferences || {};
  const currentLanguage = String(state.preferences?.language || "auto").toLowerCase();
  const incomingLanguage = String(incoming.language || currentLanguage).toLowerCase();
  const language = ["auto", "en", "es", "fr", "pt", "it", "de"].includes(incomingLanguage)
    ? incomingLanguage
    : "auto";

  state.preferences = {
    ...state.preferences,
    autoFailoverEnabled:
      incoming.autoFailoverEnabled === undefined
        ? Boolean(state.preferences?.autoFailoverEnabled)
        : Boolean(incoming.autoFailoverEnabled),
    reloadActiveTabOnToggle:
      incoming.reloadActiveTabOnToggle === undefined
        ? Boolean(state.preferences?.reloadActiveTabOnToggle)
        : Boolean(incoming.reloadActiveTabOnToggle),
    syncServersWithAccount:
      incoming.syncServersWithAccount === undefined
        ? Boolean(state.preferences?.syncServersWithAccount)
        : Boolean(incoming.syncServersWithAccount),
    language
  };

  await saveState(state);
  if (state.preferences.syncServersWithAccount) {
    const syncedState = await pullServersFromSyncIfEnabled(state);
    await pushServersToSyncIfEnabled(syncedState);
    await applyActiveProxy(syncedState);
    await addLog("info", "Preferencias actualizadas", {
      preferences: syncedState.preferences
    });
    return syncedState;
  }
  await addLog("info", "Preferencias actualizadas", {
    preferences: state.preferences
  });
  return state;
}

function getNextServerForRoundRobin(state) {
  if (!state.activeServerId || state.servers.length < 2) {
    return null;
  }

  const currentIndex = state.servers.findIndex((server) => server.id === state.activeServerId);
  if (currentIndex < 0) {
    return null;
  }

  return state.servers[(currentIndex + 1) % state.servers.length] || null;
}

async function maybeFailoverOnProxyError(details) {
  const state = await loadState();
  updateConnectionFailure(state, details);
  await saveState(state);
  await broadcastStateUpdate(state);

  const now = Date.now();
  if (now - lastProxyErrorAt > FAILOVER_ERROR_ACCUMULATION_WINDOW_MS) {
    consecutiveProxyErrors = 0;
  }
  lastProxyErrorAt = now;
  consecutiveProxyErrors += 1;

  await addLog("debug", "Evaluando failover por error de proxy", {
    error: details?.error || null,
    fatal: Boolean(details?.fatal),
    consecutiveErrors: consecutiveProxyErrors,
    requiredErrors: FAILOVER_ERRORS_BEFORE_SWITCH
  });

  if (consecutiveProxyErrors < FAILOVER_ERRORS_BEFORE_SWITCH) {
    await addLog("debug", "Failover omitido: esperando mas fallos consecutivos", {
      consecutiveErrors: consecutiveProxyErrors,
      requiredErrors: FAILOVER_ERRORS_BEFORE_SWITCH,
      accumulationWindowMs: FAILOVER_ERROR_ACCUMULATION_WINDOW_MS
    });
    return;
  }

  if (failoverInProgress) {
    await addLog("debug", "Failover omitido: ya hay uno en progreso", null);
    return;
  }

  if (now - lastFailoverAt < FAILOVER_COOLDOWN_MS) {
    await addLog("debug", "Failover omitido: cooldown activo", {
      cooldownMs: FAILOVER_COOLDOWN_MS,
      elapsedMs: now - lastFailoverAt
    });
    return;
  }

  failoverInProgress = true;
  try {
    if (!state.preferences.autoFailoverEnabled) {
      await addLog("debug", "Failover omitido: autoFailover desactivado", null);
      return;
    }

    const nextServer = getNextServerForRoundRobin(state);
    if (!nextServer) {
      await addLog("debug", "Failover omitido: no hay siguiente servidor disponible", {
        activeServerId: state.activeServerId,
        totalServers: Array.isArray(state.servers) ? state.servers.length : 0
      });
      return;
    }

    const previousServer = state.servers.find((server) => server.id === state.activeServerId) || null;
    state.activeServerId = nextServer.id;
  setFailoverError(state, details, previousServer, nextServer);
  await saveState(state);
  await broadcastStateUpdate(state);
    await applyActiveProxy(state);
    lastFailoverAt = Date.now();
    resetProxyErrorStreak();

    await addLog("warn", "Failover round-robin aplicado tras error de proxy", {
      previousServer: summarizeServer(previousServer),
      nextServer: summarizeServer(nextServer),
      proxyError: {
        error: details?.error || null,
        fatal: Boolean(details?.fatal),
        details: details?.details || null
      }
    });
  } catch (error) {
    await addLog("error", "Fallo al aplicar failover round-robin", {
      error: error.message
    });
  } finally {
    failoverInProgress = false;
  }
}

async function probeProxyConnectivityAndFailoverIfNeeded() {
  const now = Date.now();
  if (now - lastConnectivityCheckAt < CONNECTIVITY_CHECK_COOLDOWN_MS) {
    return;
  }
  lastConnectivityCheckAt = now;

  let controller;
  let timeoutId;
  let didTimeout = false;
  try {
    controller = new AbortController();
    timeoutId = globalThis.setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, CONNECTIVITY_CHECK_TIMEOUT_MS);

    const response = await fetch(CONNECTIVITY_CHECK_URL, {
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal
    });

    if (response?.status !== 204) {
      await addLog("warning", "Health-check detecto respuesta anomala", {
        status: response?.status || null,
        statusText: response?.statusText || null,
        url: CONNECTIVITY_CHECK_URL
      });
      await maybeFailoverOnProxyError({
        error: `HEALTHCHECK_HTTP_${response?.status || "UNKNOWN"}`,
        fatal: false,
        details: {
          source: "healthcheck",
          status: response?.status || null,
          url: CONNECTIVITY_CHECK_URL
        }
      });
    } else {
      const state = await loadState();
      if (state.footerStatus?.connectionFailure) {
        clearConnectionFailure(state);
        await saveState(state);
        await broadcastStateUpdate(state);
        await addLog("debug", "Health-check exitoso: racha de fallos reiniciada", {
          status: response.status,
          url: CONNECTIVITY_CHECK_URL
        });
      } else if (consecutiveProxyErrors > 0) {
        resetProxyErrorStreak();
        await addLog("debug", "Health-check exitoso: racha de fallos reiniciada", {
          status: response.status,
          url: CONNECTIVITY_CHECK_URL
        });
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isAbortError = error instanceof Error && error.name === "AbortError";

    if (didTimeout || isAbortError) {
      await addLog("warning", "Health-check agotado por timeout", {
        timeoutMs: CONNECTIVITY_CHECK_TIMEOUT_MS,
        error: errorMessage,
        url: CONNECTIVITY_CHECK_URL
      });
    } else {
      await addLog("error", "Health-check detecto fallo de conectividad", {
        error: errorMessage,
        url: CONNECTIVITY_CHECK_URL
      });
    }

    await maybeFailoverOnProxyError({
      error: errorMessage,
      fatal: false,
      details: {
        source: "healthcheck",
        reason: didTimeout || isAbortError ? "timeout" : "network_error",
        url: CONNECTIVITY_CHECK_URL
      }
    });
  } finally {
    if (timeoutId) {
      globalThis.clearTimeout(timeoutId);
    }
  }
}

function isProxyRelatedRequestError(details) {
  const code = String(details?.error || "").toUpperCase();
  return code.includes("PROXY") || code.includes("TUNNEL") || code.includes("SOCKS");
}

api.runtime.onInstalled.addListener(async () => {
  try {
    const loadedState = await loadState();
    const state = await pullServersFromSyncIfEnabled(loadedState);
    await saveState(state);
    await pushServersToSyncIfEnabled(state);
    await applyActiveProxy(state);
    await addLog("info", "Extension instalada", {
      version: api.runtime.getManifest?.().version || null,
      initialState: {
        activeServerId: state.activeServerId,
        totalServers: state.servers.length
      }
    });
  } catch (error) {
    await addLog("error", "Fallo al inicializar instalacion", { error: error.message });
  }
});

api.runtime.onStartup?.addListener(async () => {
  try {
    const loadedState = await loadState();
    const state = await pullServersFromSyncIfEnabled(loadedState);
    await applyActiveProxy(state);
    await addLog("info", "Extension iniciada", {
      activeServerId: state.activeServerId,
      totalServers: state.servers.length
    });
  } catch (error) {
    await addLog("error", "Fallo al iniciar extension", { error: error.message });
  }
});

const proxyErrorEvent = api.proxy?.onProxyError;
if (proxyErrorEvent?.addListener) {
  proxyErrorEvent.addListener((details) => {
    addLog("error", "Evento proxy.onProxyError detectado", {
      error: details?.error || null,
      fatal: Boolean(details?.fatal),
      hasDetails: Boolean(details?.details)
    }).catch(() => {
      // Ignore logging failures in event callback.
    });
    maybeFailoverOnProxyError(details);
  });
} else {
  addLog("error", "proxy.onProxyError no esta disponible en este entorno", null).catch(() => {
    // Ignore logging failures during startup.
  });
}

const webRequestErrorEvent = api.webRequest?.onErrorOccurred;
if (webRequestErrorEvent?.addListener) {
  webRequestErrorEvent.addListener(
    (details) => {
      if (!isProxyRelatedRequestError(details)) {
        return;
      }

      addLog("error", "Evento webRequest.onErrorOccurred detectado", {
        error: details?.error || null,
        url: details?.url || null,
        type: details?.type || null,
        tabId: typeof details?.tabId === "number" ? details.tabId : null
      }).catch(() => {
        // Ignore logging failures in event callback.
      });

      maybeFailoverOnProxyError({
        error: details?.error || null,
        fatal: false,
        details: {
          source: "webRequest.onErrorOccurred",
          url: details?.url || null,
          type: details?.type || null,
          tabId: typeof details?.tabId === "number" ? details.tabId : null
        }
      });
    },
    { urls: ["<all_urls>"] }
  );
} else {
  addLog("warning", "webRequest.onErrorOccurred no disponible en este entorno", null).catch(() => {
    // Ignore logging failures during startup.
  });
}

api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const actionType = message?.type;

  const run = async () => {
    await addLog("debug", "Mensaje recibido en background", {
      actionType,
      payload: getLogContext(message?.payload)
    });

    if (actionType === "proxyxt/getState") {
      const state = await handleGetState();
      return { state };
    }

    if (actionType === "proxyxt/getLogs") {
      const logs = await handleGetLogs();
      return { logs };
    }

    if (actionType === "proxyxt/clearLogs") {
      const logs = await handleClearLogs();
      return { logs };
    }

    if (actionType === "proxyxt/saveServer") {
      const state = await handleSaveServer(message.payload || {});
      await addLog("info", "Servidor guardado", getLogContext(message.payload));
      return { state };
    }

    if (actionType === "proxyxt/deleteServer") {
      const state = await handleDeleteServer(message.payload || {});
      await addLog("info", "Servidor eliminado", getLogContext(message.payload));
      return { state };
    }

    if (actionType === "proxyxt/reorderServers") {
      const state = await handleReorderServers(message.payload || {});
      return { state };
    }

    if (actionType === "proxyxt/updateUserColorPresets") {
      const state = await handleUpdateUserColorPresets(message.payload || {});
      return { state };
    }

    if (actionType === "proxyxt/activateServer") {
      const state = await handleActivateServer(message.payload || {});
      await addLog("info", "Servidor activado/desactivado", getLogContext(message.payload));
      return { state };
    }

    if (actionType === "proxyxt/updatePreferences") {
      const state = await handleUpdatePreferences(message.payload || {});
      return { state };
    }

    if (actionType === "proxyxt/dismissFooterError") {
      const state = await handleDismissFooterError();
      return { state };
    }

    throw new Error("Accion no soportada");
  };

  run()
    .then((result) => sendResponse({ ok: true, ...result }))
    .catch(async (error) => {
      await addLog("error", `Error en accion: ${actionType || "sin tipo"}`, {
        payload: getLogContext(message?.payload),
        error: error.message
      });
      sendResponse({ ok: false, error: error.message });
    });

  return true;
});
