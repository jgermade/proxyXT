const STORAGE_KEY = "proxyxt-state";
const SYNC_SERVERS_KEY = "proxyxt-sync-servers";
const LOGS_KEY = "proxyxt-logs";
const NOTIFICATIONS_ENABLE_PENDING_KEY = "proxyxt-notifications-enable-pending";
const TABS_PERMISSION_NOTIFY_PENDING_KEY = "proxyxt-tabs-permission-notify-pending";
const MAX_LOGS = 200;

export class StorageService {
  constructor(api) {
    this.api = api;
  }

  async getLocal(key) {
    if (this.api.storage?.local?.get.length <= 1) {
      return this.api.storage.local.get(key);
    }

    return new Promise((resolve, reject) => {
      this.api.storage.local.get(key, (result) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  async setLocal(value) {
    if (this.api.storage?.local?.set.length <= 1) {
      return this.api.storage.local.set(value);
    }

    return new Promise((resolve, reject) => {
      this.api.storage.local.set(value, () => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  async getSync(key) {
    if (!this.api.storage?.sync?.get) {
      return Promise.resolve({});
    }

    if (this.api.storage.sync.get.length <= 1) {
      return this.api.storage.sync.get(key);
    }

    return new Promise((resolve, reject) => {
      this.api.storage.sync.get(key, (result) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve(result);
      });
    });
  }

  async setSync(value) {
    if (!this.api.storage?.sync?.set) {
      return Promise.resolve();
    }

    if (this.api.storage.sync.set.length <= 1) {
      return this.api.storage.sync.set(value);
    }

    return new Promise((resolve, reject) => {
      this.api.storage.sync.set(value, () => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  async loadLogs() {
    const result = await this.getLocal(LOGS_KEY);
    const logs = result?.[LOGS_KEY];
    return Array.isArray(logs) ? logs : [];
  }

  async saveLogs(logs) {
    await this.setLocal({ [LOGS_KEY]: logs.slice(-MAX_LOGS) });
  }

  async addLog(level, message, context) {
    const normalizedLevel = level === "warn" ? "warning" : level;
    const logs = await this.loadLogs();
    logs.push({
      time: new Date().toISOString(),
      level: normalizedLevel,
      message,
      context: context || null
    });
    await this.saveLogs(logs);
  }

  async setNotificationsEnablePending(pending) {
    await this.setLocal({ [NOTIFICATIONS_ENABLE_PENDING_KEY]: Boolean(pending) });
  }

  async getNotificationsEnablePending() {
    const result = await this.getLocal(NOTIFICATIONS_ENABLE_PENDING_KEY);
    return Boolean(result?.[NOTIFICATIONS_ENABLE_PENDING_KEY]);
  }

  async setTabsPermissionNotifyPending(pending) {
    await this.setLocal({ [TABS_PERMISSION_NOTIFY_PENDING_KEY]: Boolean(pending) });
  }

  async getTabsPermissionNotifyPending() {
    const result = await this.getLocal(TABS_PERMISSION_NOTIFY_PENDING_KEY);
    return Boolean(result?.[TABS_PERMISSION_NOTIFY_PENDING_KEY]);
  }

  async loadState(defaultState) {
    const result = await this.getLocal(STORAGE_KEY);
    const state = result?.[STORAGE_KEY];
    if (!state) {
      return { ...defaultState };
    }

    return {
      ...defaultState,
      ...state,
      servers: Array.isArray(state.servers) ? state.servers : [],
      userColorPresets: (defaultState.sanitizeUserColorPresets || ((v) => Array.isArray(v) ? v : []))(state.userColorPresets),
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

  async saveState(state, storageKey) {
    await this.setLocal({ [storageKey || STORAGE_KEY]: state });
  }
}