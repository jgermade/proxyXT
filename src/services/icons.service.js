import { ACTIVE_ICON_PATHS, DEFAULT_SELECTION_COLOR, ICON_SIZES, INACTIVE_ICON_PATHS } from "../lib/constants.js";
import { sanitizeColorHex, getContrastingTextColor, getCanvasContext, drawRoundedRect, loadLogoBitmap, createDynamicIconSet } from "../lib/background-helpers.js";

export class IconsService {
  constructor(api, addLog) {
    this.api = api;
    this.addLog = addLog;
  }

  async setActionIcon(details) {
    const actionApi = this.api.action ?? this.api.browserAction;
    if (!actionApi?.setIcon) {
      return;
    }

    if (actionApi.setIcon.length <= 1) {
      await actionApi.setIcon(details);
      return;
    }

    return new Promise((resolve, reject) => {
      actionApi.setIcon(details, () => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
          return;
        }
        resolve();
      });
    });
  }

  async updateActionIcon(isProxyActive) {
    const actionApi = this.api.action ?? this.api.browserAction;
    if (!actionApi?.setIcon) {
      return;
    }

    try {
      await this.setActionIcon({ path: ACTIVE_ICON_PATHS });
    } catch (error) {
      await this.addLog("warn", "No se pudo actualizar icono de la extension", {
        isProxyActive,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async updateActionIconForActiveServer(server) {
    const activeColor = sanitizeColorHex(server?.selectionColor) || DEFAULT_SELECTION_COLOR;

    try {
      const imageData = await createDynamicIconSet(activeColor, this.api);
      if (imageData) {
        await this.setActionIcon({ imageData });
        return;
      }
    } catch (error) {
      await this.addLog("warn", "No se pudo generar icono dinamico de la extension", {
        activeColor,
        error: error instanceof Error ? error.message : String(error)
      });
    }

    await this.updateActionIcon(true);
  }

  async refreshActionIconForState(state) {
    const activeServer = state?.servers?.find((server) => server.id === state?.activeServerId) || null;
    if (!activeServer) {
      await this.updateActionIcon(false);
      return;
    }

    await this.updateActionIconForActiveServer(activeServer);
  }
}