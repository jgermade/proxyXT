import {
  FAILOVER_COOLDOWN_MS, FAILOVER_ERRORS_BEFORE_SWITCH, FAILOVER_ERROR_ACCUMULATION_WINDOW_MS,
  CONNECTIVITY_CHECK_COOLDOWN_MS, CONNECTIVITY_CHECK_TIMEOUT_MS, CONNECTIVITY_CHECK_URL,
  STORAGE_KEY, SYNC_SERVERS_KEY, DEFAULT_SELECTION_COLOR
} from "../lib/constants.js";
import {
  generateId, sanitizeServer, sanitizeUserColorPresets, getLogContext,
  summarizeServer, summarizeProxyValue, mapServerToProxyRules,
  updateConnectionFailure, clearConnectionFailure, setFailoverError
} from "../lib/background-helpers.js";
import { getLogMessage } from "../lib/background-i18n.js";

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
    syncServersWithAccount: false,
    showFailoverNotifications: false
  }
};

export class ListenersService {
  constructor(api, storageService, iconsService, notificationsService) {
    this.api = api;
    this.storageService = storageService;
    this.iconsService = iconsService;
    this.notificationsService = notificationsService;

    // Failover tracking state
    this.failoverInProgress = false;
    this.lastFailoverAt = 0;
    this.lastConnectivityCheckAt = 0;
    this.consecutiveProxyErrors = 0;
    this.lastProxyErrorAt = 0;
  }

  registerAll() {
    this.registerOnInstalled();
    this.registerOnStartup();
    this.registerOnMessage();
    this.registerOnProxyError();
    this.registerPermissionsOnAdded();
  }

  // ── Broadcast ──────────────────────────────────────────────────

  async broadcastStateUpdate(state) {
    if (!this.api.runtime?.sendMessage) {
      return;
    }

    try {
      if (this.api.runtime.sendMessage.length <= 1) {
        await this.api.runtime.sendMessage({ type: "proxyxt/stateUpdated", state });
        return;
      }

      await new Promise((resolve) => {
        this.api.runtime.sendMessage({ type: "proxyxt/stateUpdated", state }, () => {
          resolve();
        });
      });
    } catch (_error) {
      // Ignore broadcast failures when no UI listeners are attached.
    }
  }

  // ── Tab helpers ────────────────────────────────────────────────

  async tabsQuery(queryInfo) {
    if (!this.api.tabs?.query) {
      return Promise.resolve([]);
    }

    if (this.api.tabs.query.length <= 1) {
      return this.api.tabs.query(queryInfo);
    }

    return new Promise((resolve, reject) => {
      this.api.tabs.query(queryInfo, (tabs) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve(Array.isArray(tabs) ? tabs : []);
      });
    });
  }

  async tabsReload(tabId) {
    if (!this.api.tabs?.reload || tabId === undefined || tabId === null) {
      return Promise.resolve();
    }

    if (this.api.tabs.reload.length <= 1) {
      return this.api.tabs.reload(tabId);
    }

    return new Promise((resolve, reject) => {
      this.api.tabs.reload(tabId, {}, () => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  async reloadCurrentActiveTab() {
    try {
      const tabs = await this.tabsQuery({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      if (!activeTab?.id) {
        return;
      }
      await this.tabsReload(activeTab.id);
      await this.storageService.addLog("debug", "Pestana activa recargada tras cambio de proxy", {
        tabId: activeTab.id
      });
    } catch (error) {
      await this.storageService.addLog("warn", "No se pudo recargar la pestana activa", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ── Proxy helpers ──────────────────────────────────────────────

  async proxySettingsSet(config) {
    if (this.api.proxy?.settings?.set.length <= 1) {
      return this.api.proxy.settings.set(config);
    }

    return new Promise((resolve, reject) => {
      this.api.proxy.settings.set(config, () => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  async proxySettingsGet(details = { incognito: false }) {
    if (this.api.proxy?.settings?.get.length <= 1) {
      return this.api.proxy.settings.get(details);
    }

    return new Promise((resolve, reject) => {
      this.api.proxy.settings.get(details, (result) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  async applyActiveProxy(state) {
    const activeServer = state.servers.find((server) => server.id === state.activeServerId);

    if (!activeServer) {
      await this.storageService.addLog("info", "Aplicando modo sistema (sin servidor activo)", {
        activeServerId: state.activeServerId
      });
      await this.proxySettingsSet({ value: { mode: "system" }, scope: "regular" });
      const current = await this.proxySettingsGet({ incognito: false });
      await this.storageService.addLog("debug", "Proxy configurado en navegador", {
        requestedMode: "system",
        effectiveMode: current?.value?.mode || null,
        levelOfControl: current?.levelOfControl || null
      });
      await this.iconsService.updateActionIcon(false);
      return;
    }

    const value = mapServerToProxyRules(activeServer);
    await this.storageService.addLog("info", "Aplicando servidor proxy activo", {
      activeServerId: state.activeServerId,
      server: summarizeServer(activeServer),
      proxy: summarizeProxyValue(value)
    });
    await this.proxySettingsSet({ value, scope: "regular" });
    const current = await this.proxySettingsGet({ incognito: false });
    await this.storageService.addLog("debug", "Proxy configurado en navegador", {
      requestedMode: value.mode,
      effectiveMode: current?.value?.mode || null,
      effectiveProxy: summarizeProxyValue(current?.value || null),
      levelOfControl: current?.levelOfControl || null
    });
    await this.iconsService.updateActionIconForActiveServer(activeServer);
  }

  // ── Sync helpers ───────────────────────────────────────────────

  async pullServersFromSyncIfEnabled(state) {
    if (!state.preferences?.syncServersWithAccount || !this.api.storage?.sync) {
      if (state.preferences?.syncServersWithAccount && !this.api.storage?.sync) {
        await this.storageService.addLog("warning", "storage.sync no disponible; no se pueden recuperar servidores", null);
      }
      return state;
    }

    const result = await this.storageService.getSync([SYNC_SERVERS_KEY, STORAGE_KEY]);
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
      await this.storageService.addLog("debug", "No hay servidores disponibles en storage.sync", null);
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
        skipped += 1;
      }
    }

    await this.storageService.addLog("debug", "Lectura de servidores desde storage.sync", {
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

    await this.storageService.saveState(nextState, STORAGE_KEY);
    await this.storageService.addLog("info", "Servidores sincronizados desde la cuenta del navegador", {
      totalServers: nextState.servers.length,
      userColorPresets: nextState.userColorPresets.length
    });
    return nextState;
  }

  async pushServersToSyncIfEnabled(state) {
    if (!state.preferences?.syncServersWithAccount || !this.api.storage?.sync) {
      return;
    }

    await this.storageService.setSync({
      [SYNC_SERVERS_KEY]: {
        servers: state.servers,
        userColorPresets: sanitizeUserColorPresets(state.userColorPresets)
      }
    });
  }

  hasSyncData(state) {
    return (
      (Array.isArray(state?.servers) && state.servers.length > 0)
      || (Array.isArray(state?.userColorPresets) && state.userColorPresets.length > 0)
    );
  }

  async pullServersFromSyncWithRetry(state, options = {}) {
    const attempts = Math.max(1, Number(options.attempts || 1));
    const delayMs = Math.max(0, Number(options.delayMs || 0));
    let currentState = state;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      currentState = await this.pullServersFromSyncIfEnabled(currentState);
      if (this.hasSyncData(currentState)) {
        return currentState;
      }

      if (attempt < attempts && delayMs > 0) {
        await this.wait(delayMs * attempt);
      }
    }

    return currentState;
  }

  wait(ms) {
    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  // ── Failover logic ─────────────────────────────────────────────

  resetProxyErrorStreak() {
    this.consecutiveProxyErrors = 0;
    this.lastProxyErrorAt = 0;
  }

  getNextServerForRoundRobin(state) {
    if (!state.activeServerId || state.servers.length < 2) {
      return null;
    }

    const currentIndex = state.servers.findIndex((server) => server.id === state.activeServerId);
    if (currentIndex < 0) {
      return null;
    }

    return state.servers[(currentIndex + 1) % state.servers.length] || null;
  }

  async maybeFailoverOnProxyError(details) {
    const state = await this.storageService.loadState(defaultState);
    updateConnectionFailure(state, details);
    await this.storageService.saveState(state, STORAGE_KEY);
    await this.broadcastStateUpdate(state);

    const now = Date.now();
    if (now - this.lastProxyErrorAt > FAILOVER_ERROR_ACCUMULATION_WINDOW_MS) {
      this.consecutiveProxyErrors = 0;
    }
    this.lastProxyErrorAt = now;
    this.consecutiveProxyErrors += 1;

    await this.storageService.addLog("debug", "Evaluando failover por error de proxy", {
      error: details?.error || null,
      fatal: Boolean(details?.fatal),
      consecutiveErrors: this.consecutiveProxyErrors,
      requiredErrors: FAILOVER_ERRORS_BEFORE_SWITCH
    });

    if (this.consecutiveProxyErrors < FAILOVER_ERRORS_BEFORE_SWITCH) {
      await this.storageService.addLog("debug", "Failover omitido: esperando mas fallos consecutivos", {
        consecutiveErrors: this.consecutiveProxyErrors,
        requiredErrors: FAILOVER_ERRORS_BEFORE_SWITCH,
        accumulationWindowMs: FAILOVER_ERROR_ACCUMULATION_WINDOW_MS
      });
      return;
    }

    if (this.failoverInProgress) {
      await this.storageService.addLog("debug", "Failover omitido: ya hay uno en progreso", null);
      return;
    }

    if (now - this.lastFailoverAt < FAILOVER_COOLDOWN_MS) {
      await this.storageService.addLog("debug", "Failover omitido: cooldown activo", {
        cooldownMs: FAILOVER_COOLDOWN_MS,
        elapsedMs: now - this.lastFailoverAt
      });
      return;
    }

    this.failoverInProgress = true;
    try {
      if (!state.preferences.autoFailoverEnabled) {
        await this.storageService.addLog("debug", "Failover omitido: autoFailover desactivado", null);
        return;
      }

      const nextServer = this.getNextServerForRoundRobin(state);
      if (!nextServer) {
        await this.storageService.addLog("debug", "Failover omitido: no hay siguiente servidor disponible", {
          activeServerId: state.activeServerId,
          totalServers: Array.isArray(state.servers) ? state.servers.length : 0
        });
        return;
      }

      const previousServer = state.servers.find((server) => server.id === state.activeServerId) || null;
      state.activeServerId = nextServer.id;
      setFailoverError(state, details, previousServer, nextServer);
      await this.storageService.saveState(state, STORAGE_KEY);
      await this.broadcastStateUpdate(state);
      await this.applyActiveProxy(state);
      await this.notificationsService.maybeNotifyFailoverSwitch(state, previousServer, nextServer);
      this.lastFailoverAt = Date.now();
      this.resetProxyErrorStreak();

      await this.storageService.addLog("warn", "Failover round-robin aplicado tras error de proxy", {
        previousServer: summarizeServer(previousServer),
        nextServer: summarizeServer(nextServer),
        proxyError: {
          error: details?.error || null,
          fatal: Boolean(details?.fatal),
          details: details?.details || null
        }
      });
    } catch (error) {
      await this.storageService.addLog("error", "Fallo al aplicar failover round-robin", {
        error: error.message
      });
    } finally {
      this.failoverInProgress = false;
    }
  }

  async probeProxyConnectivityAndFailoverIfNeeded() {
    const now = Date.now();
    if (now - this.lastConnectivityCheckAt < CONNECTIVITY_CHECK_COOLDOWN_MS) {
      return;
    }
    this.lastConnectivityCheckAt = now;

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
        await this.storageService.addLog("warning", "Health-check detecto respuesta anomala", {
          status: response?.status || null,
          statusText: response?.statusText || null,
          url: CONNECTIVITY_CHECK_URL
        });
        await this.maybeFailoverOnProxyError({
          error: `HEALTHCHECK_HTTP_${response?.status || "UNKNOWN"}`,
          fatal: false,
          details: {
            source: "healthcheck",
            status: response?.status || null,
            url: CONNECTIVITY_CHECK_URL
          }
        });
      } else {
        const state = await this.storageService.loadState(defaultState);
        if (state.footerStatus?.connectionFailure) {
          clearConnectionFailure(state);
          await this.storageService.saveState(state, STORAGE_KEY);
          await this.broadcastStateUpdate(state);
        } else if (this.consecutiveProxyErrors > 0) {
          this.resetProxyErrorStreak();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isAbortError = error instanceof Error && error.name === "AbortError";

      if (didTimeout || isAbortError) {
        await this.storageService.addLog("warning", "Health-check agotado por timeout", {
          timeoutMs: CONNECTIVITY_CHECK_TIMEOUT_MS,
          error: errorMessage,
          url: CONNECTIVITY_CHECK_URL
        });
      } else {
        await this.storageService.addLog("error", "Health-check detecto fallo de conectividad", {
          error: errorMessage,
          url: CONNECTIVITY_CHECK_URL
        });
      }

      await this.maybeFailoverOnProxyError({
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

  // ── Message handlers ───────────────────────────────────────────

  async handleGetState() {
    const state = await this.storageService.loadState(defaultState);
    const syncedState = await this.pullServersFromSyncIfEnabled(state);

    await this.iconsService.refreshActionIconForState(syncedState);

    if (syncedState.preferences?.autoFailoverEnabled && syncedState.activeServerId) {
      void this.probeProxyConnectivityAndFailoverIfNeeded();
    }

    return syncedState;
  }

  async handleGetLogs() {
    return this.storageService.loadLogs();
  }

  async handleClearLogs() {
    await this.storageService.saveLogs([]);
    return [];
  }

  async handleSaveServer(payload) {
    const incoming = sanitizeServer(payload.server || {});
    const state = await this.storageService.loadState(defaultState);

    const index = state.servers.findIndex((server) => server.id === incoming.id);
    if (index >= 0) {
      state.servers[index] = incoming;
    } else {
      state.servers.push(incoming);
    }

    await this.storageService.saveState(state, STORAGE_KEY);
    await this.pushServersToSyncIfEnabled(state);
    await this.iconsService.refreshActionIconForState(state);
    await this.storageService.addLog("debug", "Estado actualizado tras guardar servidor", {
      server: summarizeServer(incoming),
      totalServers: state.servers.length,
      activeServerId: state.activeServerId
    });
    return state;
  }

  async handleReorderServers(payload) {
    const state = await this.storageService.loadState(defaultState);
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
    await this.storageService.saveState(state, STORAGE_KEY);
    await this.pushServersToSyncIfEnabled(state);
    await this.storageService.addLog("debug", "Estado actualizado tras reordenar servidores", {
      totalServers: state.servers.length
    });
    return state;
  }

  async handleUpdateUserColorPresets(payload) {
    const state = await this.storageService.loadState(defaultState);
    state.userColorPresets = sanitizeUserColorPresets(payload?.userColorPresets || payload?.colors || []);
    await this.storageService.saveState(state, STORAGE_KEY);
    await this.pushServersToSyncIfEnabled(state);
    await this.storageService.addLog("debug", "Estado actualizado tras guardar colores personalizados", {
      userColorPresets: state.userColorPresets.length
    });
    return state;
  }

  async handleDeleteServer(payload) {
    const serverId = payload.serverId;
    const state = await this.storageService.loadState(defaultState);
    const deletedServer = state.servers.find((server) => server.id === serverId) || null;

    state.servers = state.servers.filter((server) => server.id !== serverId);
    if (state.activeServerId === serverId) {
      state.activeServerId = null;
    }

    await this.storageService.saveState(state, STORAGE_KEY);
    await this.pushServersToSyncIfEnabled(state);
    await this.applyActiveProxy(state);
    await this.storageService.addLog("debug", "Estado actualizado tras eliminar servidor", {
      serverId,
      deletedServer: summarizeServer(deletedServer),
      totalServers: state.servers.length,
      activeServerId: state.activeServerId
    });
    return state;
  }

  async handleActivateServer(payload) {
    const state = await this.storageService.loadState(defaultState);
    const serverId = payload.serverId;

    await this.storageService.addLog("debug", "Solicitud de cambio de servidor activo", {
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

    await this.storageService.saveState(state, STORAGE_KEY);
    await this.applyActiveProxy(state);
    if (state.preferences?.reloadActiveTabOnToggle) {
      await this.reloadCurrentActiveTab();
    }
    await this.storageService.addLog("debug", "Estado actualizado tras activar/desactivar", {
      activeServerId: state.activeServerId
    });
    return state;
  }

  async handleUpdatePreferences(payload) {
    const state = await this.storageService.loadState(defaultState);
    const wasSyncEnabled = Boolean(state.preferences?.syncServersWithAccount);
    const previousAutoFailoverEnabled = Boolean(state.preferences?.autoFailoverEnabled);
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
      showFailoverNotifications:
        incoming.showFailoverNotifications === undefined
          ? Boolean(state.preferences?.showFailoverNotifications)
          : Boolean(incoming.showFailoverNotifications),
      language
    };

    const currentAutoFailoverEnabled = Boolean(state.preferences?.autoFailoverEnabled);
    if (currentAutoFailoverEnabled !== previousAutoFailoverEnabled) {
      await this.storageService.addLog(
        "info",
        currentAutoFailoverEnabled
          ? "Failover automatico activado (deteccion via proxy.onProxyError, sin permisos adicionales)"
          : "Failover automatico desactivado",
        {
          autoFailoverEnabled: currentAutoFailoverEnabled,
          detectionSource: "proxy.onProxyError"
        }
      );
    }

    await this.storageService.saveState(state, STORAGE_KEY);
    if (state.preferences.syncServersWithAccount) {
      const isEnablingSync = !wasSyncEnabled;
      const localHadDataBeforeSync = this.hasSyncData(state);
      if (isEnablingSync && !localHadDataBeforeSync) {
        await this.storageService.addLog("debug", "Sincronizacion activada tras reinstalacion: esperando datos remotos con reintentos", {
          attempts: 6,
          baseDelayMs: 350
        });
      }

      const syncedState = isEnablingSync && !localHadDataBeforeSync
        ? await this.pullServersFromSyncWithRetry(state, { attempts: 6, delayMs: 350 })
        : await this.pullServersFromSyncIfEnabled(state);
      const hasAnyDataToSync =
        Array.isArray(syncedState.servers) && syncedState.servers.length > 0
        || Array.isArray(syncedState.userColorPresets) && syncedState.userColorPresets.length > 0;

      if (!isEnablingSync || hasAnyDataToSync) {
        await this.pushServersToSyncIfEnabled(syncedState);
      } else {
        await this.storageService.addLog("debug", "Sincronizacion habilitada sin datos locales: se omite push inicial para evitar sobrescritura vacia", null);
      }

      await this.applyActiveProxy(syncedState);
      await this.storageService.addLog("info", "Preferencias actualizadas", {
        preferences: syncedState.preferences
      });
      return syncedState;
    }
    await this.storageService.addLog("info", "Preferencias actualizadas", {
      preferences: state.preferences
    });
    return state;
  }

  async handleEnableFailoverNotifications() {
    const currentState = await this.storageService.loadState(defaultState);
    const alreadyEnabled = Boolean(currentState.preferences?.showFailoverNotifications);
    if (alreadyEnabled) {
      await this.storageService.setNotificationsEnablePending(false);
      return currentState;
    }

    const state = await this.handleUpdatePreferences({
      preferences: {
        showFailoverNotifications: true
      }
    });

    await this.storageService.setNotificationsEnablePending(false);
    await this.notificationsService.notifyFailoverNotificationsEnabled(state);
    await this.storageService.addLog("info", "Notificaciones de failover activadas por el usuario", null);
    return state;
  }

  async handleSetNotificationsEnablePending(payload) {
    await this.storageService.setNotificationsEnablePending(Boolean(payload?.pending));
    const state = await this.storageService.loadState(defaultState);
    return state;
  }

  async handleSetTabsPermissionNotifyPending(payload) {
    await this.storageService.setTabsPermissionNotifyPending(Boolean(payload?.pending));
    const state = await this.storageService.loadState(defaultState);
    return state;
  }

  async handleNotifyTabsPermissionEnabled() {
    const state = await this.storageService.loadState(defaultState);
    await this.notificationsService.notifyTabsPermissionEnabled(state);
    await this.storageService.setTabsPermissionNotifyPending(false);
    return state;
  }

  async handleDismissFooterError() {
    const state = await this.storageService.loadState(defaultState);
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

    await this.storageService.saveState(state, STORAGE_KEY);
    await this.broadcastStateUpdate(state);
    await this.storageService.addLog("debug", "Aviso del footer descartado por el usuario", {
      hadActiveError: hasActiveError,
      hadConnectionFailure: hasConnectionFailure
    });
    return state;
  }

  // ── Event Listener Registrations ───────────────────────────────

  registerOnInstalled() {
    this.api.runtime.onInstalled.addListener(async () => {
      try {
        const loadedState = await this.storageService.loadState(defaultState);
        const state = await this.pullServersFromSyncIfEnabled(loadedState);
        await this.storageService.saveState(state, STORAGE_KEY);
        await this.pushServersToSyncIfEnabled(state);
        await this.applyActiveProxy(state);
        await this.storageService.addLog("info", "Extension instalada", {
          version: this.api.runtime.getManifest?.().version || null,
          initialState: {
            activeServerId: state.activeServerId,
            totalServers: state.servers.length
          }
        });
      } catch (error) {
        await this.storageService.addLog("error", "Fallo al inicializar instalacion", { error: error.message });
      }
    });
  }

  registerOnStartup() {
    if (!this.api.runtime.onStartup?.addListener) {
      return;
    }

    this.api.runtime.onStartup.addListener(async () => {
      try {
        const loadedState = await this.storageService.loadState(defaultState);
        const state = await this.pullServersFromSyncIfEnabled(loadedState);
        await this.applyActiveProxy(state);
        await this.storageService.addLog("info", "Extension iniciada", {
          activeServerId: state.activeServerId,
          totalServers: state.servers.length
        });
      } catch (error) {
        await this.storageService.addLog("error", "Fallo al iniciar extension", { error: error.message });
      }
    });
  }

  registerOnProxyError() {
    const proxyErrorEvent = this.api.proxy?.onProxyError;
    if (proxyErrorEvent?.addListener) {
      proxyErrorEvent.addListener((details) => {
        this.storageService.addLog("error", "Evento proxy.onProxyError detectado", {
          error: details?.error || null,
          fatal: Boolean(details?.fatal),
          hasDetails: Boolean(details?.details)
        }).catch(() => {});
        this.maybeFailoverOnProxyError(details);
      });
    } else {
      this.storageService.addLog("error", "proxy.onProxyError no esta disponible en este entorno", null).catch(() => {});
    }
  }

  registerPermissionsOnAdded() {
    if (!this.api.permissions?.onAdded?.addListener) {
      return;
    }

    this.api.permissions.onAdded.addListener((details) => {
      const permissions = Array.isArray(details?.permissions) ? details.permissions : [];

      (async () => {
        const stateForLogs = await this.storageService.loadState(defaultState);

        if (permissions.includes("notifications")) {
          const notificationsPending = await this.storageService.getNotificationsEnablePending();
          if (notificationsPending) {
            await this.storageService.addLog("debug", getLogMessage(stateForLogs, "notificationsPermissionGrantedPending"), {
              permissions
            });
            await this.handleEnableFailoverNotifications();
            const state = await this.storageService.loadState(defaultState);
            await this.broadcastStateUpdate(state);
          }
        }

        if (permissions.includes("tabs")) {
          const tabsNotifyPending = await this.storageService.getTabsPermissionNotifyPending();
          if (!tabsNotifyPending) {
            return;
          }

          await this.storageService.addLog("debug", getLogMessage(stateForLogs, "tabsPermissionGrantedNotify"), {
            permissions
          });
          await this.handleNotifyTabsPermissionEnabled();
        }
      })().catch((error) => {
        this.storageService.loadState(defaultState)
          .then((sf) => this.storageService.addLog("warn", getLogMessage(sf, "permissionsPendingFlowFailed"), {
            error: error instanceof Error ? error.message : String(error)
          }))
          .catch(() => this.storageService.addLog("warn", "No se pudo completar el flujo pendiente de permisos", {
            error: error instanceof Error ? error.message : String(error)
          }))
          .catch(() => {});
      });
    });
  }

  registerOnMessage() {
    this.api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      const actionType = message?.type;

      const run = async () => {
        await this.storageService.addLog("debug", "Mensaje recibido en background", {
          actionType,
          payload: getLogContext(message?.payload)
        });

        if (actionType === "proxyxt/getState") {
          const state = await this.handleGetState();
          return { state };
        }

        if (actionType === "proxyxt/getLogs") {
          const logs = await this.handleGetLogs();
          return { logs };
        }

        if (actionType === "proxyxt/clearLogs") {
          const logs = await this.handleClearLogs();
          return { logs };
        }

        if (actionType === "proxyxt/saveServer") {
          const state = await this.handleSaveServer(message.payload || {});
          await this.storageService.addLog("info", "Servidor guardado", getLogContext(message.payload));
          return { state };
        }

        if (actionType === "proxyxt/deleteServer") {
          const state = await this.handleDeleteServer(message.payload || {});
          await this.storageService.addLog("info", "Servidor eliminado", getLogContext(message.payload));
          return { state };
        }

        if (actionType === "proxyxt/reorderServers") {
          const state = await this.handleReorderServers(message.payload || {});
          return { state };
        }

        if (actionType === "proxyxt/updateUserColorPresets") {
          const state = await this.handleUpdateUserColorPresets(message.payload || {});
          return { state };
        }

        if (actionType === "proxyxt/activateServer") {
          const state = await this.handleActivateServer(message.payload || {});
          await this.storageService.addLog("info", "Servidor activado/desactivado", getLogContext(message.payload));
          return { state };
        }

        if (actionType === "proxyxt/updatePreferences") {
          const state = await this.handleUpdatePreferences(message.payload || {});
          return { state };
        }

        if (actionType === "proxyxt/enableFailoverNotifications") {
          const state = await this.handleEnableFailoverNotifications();
          return { state };
        }

        if (actionType === "proxyxt/setNotificationsEnablePending") {
          const state = await this.handleSetNotificationsEnablePending(message.payload || {});
          return { state };
        }

        if (actionType === "proxyxt/setTabsPermissionNotifyPending") {
          const state = await this.handleSetTabsPermissionNotifyPending(message.payload || {});
          return { state };
        }

        if (actionType === "proxyxt/notifyTabsPermissionEnabled") {
          const state = await this.handleNotifyTabsPermissionEnabled();
          return { state };
        }

        if (actionType === "proxyxt/dismissFooterError") {
          const state = await this.handleDismissFooterError();
          return { state };
        }

        throw new Error("Accion no soportada");
      };

      run()
        .then((result) => sendResponse({ ok: true, ...result }))
        .catch(async (error) => {
          await this.storageService.addLog("error", `Error en accion: ${actionType || "sin tipo"}`, {
            payload: getLogContext(message?.payload),
            error: error.message
          });
          sendResponse({ ok: false, error: error.message });
        });

      return true;
    });
  }
}