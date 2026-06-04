const api = globalThis.browser ?? globalThis.chrome;

const STORAGE_KEY = "proxyxt-state";
const SYNC_SERVERS_KEY = "proxyxt-sync-servers";
const LOGS_KEY = "proxyxt-logs";
const MAX_LOGS = 200;
const FAILOVER_COOLDOWN_MS = 5000;
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

const defaultState = {
  activeServerId: null,
  servers: [],
  preferences: {
    autoFailoverEnabled: false,
    language: "auto",
    reloadActiveTabOnToggle: false,
    syncServersWithAccount: false
  }
};

let failoverInProgress = false;
let lastFailoverAt = 0;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
  const logs = await loadLogs();
  logs.push({
    time: new Date().toISOString(),
    level,
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

async function updateActionIcon(isProxyActive) {
  const actionApi = api.action ?? api.browserAction;
  if (!actionApi?.setIcon) {
    return;
  }

  const path = isProxyActive ? ACTIVE_ICON_PATHS : INACTIVE_ICON_PATHS;

  try {
    if (actionApi.setIcon.length <= 1) {
      await actionApi.setIcon({ path });
      return;
    }

    await new Promise((resolve, reject) => {
      actionApi.setIcon({ path }, () => {
        if (api.runtime.lastError) {
          reject(new Error(api.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  } catch (error) {
    await addLog("warn", "No se pudo actualizar icono de la extension", {
      isProxyActive,
      error: error instanceof Error ? error.message : String(error)
    });
  }
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
  await updateActionIcon(true);
}

function sanitizeServer(rawServer) {
  const server = {
    id: rawServer.id || generateId(),
    name: String(rawServer.name || "").trim(),
    scheme: String(rawServer.scheme || "http").trim().toLowerCase(),
    host: String(rawServer.host || "").trim(),
    port: String(rawServer.port || "").trim(),
    bypassList: String(rawServer.bypassList || "").trim()
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
    return state;
  }

  const result = await storageSyncGet(SYNC_SERVERS_KEY);
  const syncedServersRaw = result?.[SYNC_SERVERS_KEY];
  if (!Array.isArray(syncedServersRaw)) {
    return state;
  }

  const syncedServers = [];
  for (const raw of syncedServersRaw) {
    try {
      syncedServers.push(sanitizeServer(raw));
    } catch (_error) {
      // Skip invalid synced entries instead of failing the whole sync process.
    }
  }

  const localSnapshot = JSON.stringify(state.servers);
  const syncedSnapshot = JSON.stringify(syncedServers);
  if (localSnapshot === syncedSnapshot) {
    return state;
  }

  const nextState = {
    ...state,
    servers: syncedServers,
    activeServerId: syncedServers.some((server) => server.id === state.activeServerId) ? state.activeServerId : null
  };

  await saveState(nextState);
  await addLog("info", "Servidores sincronizados desde la cuenta del navegador", {
    totalServers: nextState.servers.length
  });
  return nextState;
}

async function pushServersToSyncIfEnabled(state) {
  if (!state.preferences?.syncServersWithAccount || !api.storage?.sync) {
    return;
  }

  await storageSyncSet({ [SYNC_SERVERS_KEY]: state.servers });
}

async function handleGetState() {
  const state = await loadState();
  return pullServersFromSyncIfEnabled(state);
}

async function handleGetLogs() {
  return loadLogs();
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
  if (failoverInProgress) {
    return;
  }

  const now = Date.now();
  if (now - lastFailoverAt < FAILOVER_COOLDOWN_MS) {
    return;
  }

  failoverInProgress = true;
  try {
    const state = await loadState();
    if (!state.preferences.autoFailoverEnabled) {
      return;
    }

    const nextServer = getNextServerForRoundRobin(state);
    if (!nextServer) {
      return;
    }

    const previousServer = state.servers.find((server) => server.id === state.activeServerId) || null;
    state.activeServerId = nextServer.id;
    await saveState(state);
    await applyActiveProxy(state);
    lastFailoverAt = Date.now();

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
    maybeFailoverOnProxyError(details);
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

    if (actionType === "proxyxt/activateServer") {
      const state = await handleActivateServer(message.payload || {});
      await addLog("info", "Servidor activado/desactivado", getLogContext(message.payload));
      return { state };
    }

    if (actionType === "proxyxt/updatePreferences") {
      const state = await handleUpdatePreferences(message.payload || {});
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
