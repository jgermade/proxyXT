import { DEFAULT_SELECTION_COLOR, MAX_USER_COLOR_PRESETS, INACTIVE_ICON_PATHS, ICON_SIZES } from "./constants.js";

export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function sanitizeColorHex(color) {
  const normalized = String(color || "").trim().toUpperCase();
  return /^#([0-9A-F]{3}|[0-9A-F]{6})$/.test(normalized) ? normalized : null;
}

export function getContrastingTextColor(hexColor) {
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

export function sanitizeUserColorPresets(rawColors) {
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

export function getLogContext(payload) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  return { ...payload };
}

export function summarizeServer(server) {
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

export function summarizeProxyValue(value) {
  const mode = value?.mode || null;
  const singleProxy = value?.rules?.singleProxy || null;
  return {
    mode,
    singleProxy,
    bypassCount: Array.isArray(value?.rules?.bypassList) ? value.rules.bypassList.length : 0
  };
}

export function sanitizeServer(rawServer) {
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

export function mapServerToProxyRules(server) {
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

export function updateConnectionFailure(state, details) {
  const now = Date.now();
  const current = state.footerStatus?.connectionFailure || null;
  const lastAttemptAt = current ? Number(current.lastAttemptAt || current.startedAt || 0) : 0;
  const needsReset = !current || now - lastAttemptAt > 20000; // FAILOVER_ERROR_ACCUMULATION_WINDOW_MS

  state.footerStatus = {
    ...(state.footerStatus || {}),
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

export function clearConnectionFailure(state) {
  if (!state.footerStatus?.connectionFailure) {
    return state;
  }

  state.footerStatus = {
    ...(state.footerStatus || {}),
    connectionFailure: null
  };

  return state;
}

export function setFailoverError(state, details, previousServer, nextServer) {
  state.footerStatus = {
    ...(state.footerStatus || {}),
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

export function getCanvasContext(size) {
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

export function drawRoundedRect(ctx, size, color) {
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

const logoBitmapCache = new Map();

export async function loadLogoBitmap(api) {
  if (typeof createImageBitmap !== "function" || !api.runtime?.getURL) {
    return null;
  }

  const sizesToLoad = ICON_SIZES.filter((size) => !logoBitmapCache.has(String(size)));
  if (sizesToLoad.length === 0) {
    return logoBitmapCache;
  }

  for (const size of sizesToLoad) {
    const logoPath = INACTIVE_ICON_PATHS[size] || INACTIVE_ICON_PATHS[16];
    if (!logoPath) {
      continue;
    }

    try {
      const response = await fetch(api.runtime.getURL(logoPath));
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      logoBitmapCache.set(String(size), bitmap);
    } catch {
      // Skip if bitmap loading fails for this size
    }
  }

  return logoBitmapCache;
}

const dynamicIconCache = new Map();

export async function createDynamicIconSet(activeColor, api) {
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

    const logoBitmap = await loadLogoBitmap(api);
    if (!logoBitmap) {
      return null;
    }

    const bitmap = logoBitmap.get(String(size));
    if (!bitmap) {
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
    logoCtx.drawImage(bitmap, logoInset, logoInset, logoSize, logoSize);
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

export function isProxyRelatedRequestError(details) {
  const code = String(details?.error || "").toUpperCase();
  return code.includes("PROXY") || code.includes("TUNNEL") || code.includes("SOCKS");
}
