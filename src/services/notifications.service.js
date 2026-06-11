import { ACTIVE_ICON_PATHS } from "../lib/constants.js";
import { getNotificationMessage } from "../lib/background-i18n.js";

export class NotificationsService {
  constructor(api, addLog) {
    this.api = api;
    this.addLog = addLog;
  }

  async permissionsContains(details) {
    if (!this.api.permissions?.contains) {
      return Promise.resolve(false);
    }

    if (this.api.permissions.contains.length <= 1) {
      return this.api.permissions.contains(details);
    }

    return new Promise((resolve, reject) => {
      this.api.permissions.contains(details, (result) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve(Boolean(result));
      });
    });
  }

  async notificationsCreate(notificationId, options) {
    if (!this.api.notifications?.create) {
      return Promise.resolve(null);
    }

    if (this.api.notifications.create.length <= 2) {
      return Promise.resolve()
        .then(() => this.api.notifications.create(notificationId, options))
        .catch(() => this.api.notifications.create(options));
    }

    return new Promise((resolve, reject) => {
      this.api.notifications.create(notificationId, options, (createdId) => {
        if (!this.api.runtime.lastError) {
          resolve(createdId || null);
          return;
        }

        this.api.notifications.create(options, (fallbackCreatedId) => {
          if (this.api.runtime.lastError) {
            reject(new Error(this.api.runtime.lastError.message));
            return;
          }
          resolve(fallbackCreatedId || null);
        });
      });
    });
  }

  wait(ms) {
    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, ms);
    });
  }

  async maybeNotifyFailoverSwitch(state, previousServer, nextServer) {
    if (!state?.preferences?.showFailoverNotifications) {
      return;
    }

    try {
      const hasPermission = await this.permissionsContains({ permissions: ["notifications"] });
      if (!hasPermission) {
        return;
      }

      const previousLabel = previousServer?.name || (previousServer ? `${previousServer.host}:${previousServer.port}` : "Sistema");
      const nextLabel = nextServer?.name || (nextServer ? `${nextServer.host}:${nextServer.port}` : "Sistema");
      const notificationId = `proxyxt-failover-${Date.now()}`;
      const iconUrl = this.api.runtime?.getURL
        ? this.api.runtime.getURL(ACTIVE_ICON_PATHS[128])
        : ACTIVE_ICON_PATHS[128];
      const message = getNotificationMessage(state, "failoverSwitch", {
        from: previousLabel,
        to: nextLabel
      });
      await this.notificationsCreate(notificationId, {
        type: "basic",
        iconUrl,
        title: "ProxyXT",
        message
      });
    } catch (error) {
      await this.addLog("warn", "No se pudo mostrar notificacion de failover", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async notifyFailoverNotificationsEnabled(state) {
    const iconUrl = this.api.runtime?.getURL
      ? this.api.runtime.getURL(ACTIVE_ICON_PATHS[128])
      : ACTIVE_ICON_PATHS[128];
    const message = getNotificationMessage(state, "failoverEnabled");

    let lastError = null;
    for (const delayMs of [0, 180, 420]) {
      try {
        if (delayMs > 0) {
          await this.wait(delayMs);
        }

        const notificationId = `proxyxt-failover-enabled-${Date.now()}`;
        await this.notificationsCreate(notificationId, {
          type: "basic",
          iconUrl,
          title: "ProxyXT",
          message
        });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) {
      await this.addLog("warn", "No se pudo mostrar notificacion de confirmacion", {
        error: lastError instanceof Error ? lastError.message : String(lastError)
      });
    }
  }

  async notifyTabsPermissionEnabled(state) {
    try {
      const hasPermission = await this.permissionsContains({ permissions: ["notifications"] });
      if (!hasPermission) {
        return;
      }

      const notificationId = `proxyxt-tabs-permission-${Date.now()}`;
      const iconUrl = this.api.runtime?.getURL
        ? this.api.runtime.getURL(ACTIVE_ICON_PATHS[128])
        : ACTIVE_ICON_PATHS[128];
      const message = getNotificationMessage(state, "tabsPermissionEnabled");
      await this.notificationsCreate(notificationId, {
        type: "basic",
        iconUrl,
        title: "ProxyXT",
        message
      });
    } catch (error) {
      await this.addLog("warn", "No se pudo mostrar notificacion de permiso de pestanas", {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}