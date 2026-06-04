const api = globalThis.browser ?? globalThis.chrome;

const ui = {
  app: document.querySelector(".app"),
  headerSubtitle: document.getElementById("headerSubtitle"),
  toggleViewButton: document.getElementById("toggleViewButton"),
  listPanel: document.getElementById("listPanel"),
  formPanel: document.getElementById("formPanel"),
  appFooter: document.getElementById("appFooter"),
  activeFooter: document.getElementById("activeFooter"),
  toggleLogs: document.getElementById("toggleLogs"),
  logsPanel: document.getElementById("logsPanel"),
  logsContent: document.getElementById("logsContent"),
  serverList: document.getElementById("serverList"),
  emptyState: document.getElementById("emptyState"),
  proxyForm: document.getElementById("proxyForm"),
  serverId: document.getElementById("serverId"),
  name: document.getElementById("name"),
  scheme: document.getElementById("scheme"),
  host: document.getElementById("host"),
  port: document.getElementById("port"),
  bypassList: document.getElementById("bypassList"),
  submitButton: document.getElementById("submitButton"),
  deleteServer: document.getElementById("deleteServer")
};

let state = {
  activeServerId: null,
  servers: []
};

let currentView = "list";
let currentFormMode = "new";

function sendMessage(message) {
  if (api.runtime.sendMessage.length <= 1) {
    return api.runtime.sendMessage(message);
  }

  return new Promise((resolve, reject) => {
    api.runtime.sendMessage(message, (response) => {
      if (api.runtime.lastError) {
        reject(new Error(api.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

async function callBackground(type, payload = {}) {
  const response = await sendMessage({ type, payload });
  if (!response?.ok) {
    throw new Error(response?.error || "Error desconocido");
  }
  if (response.state) {
    state = response.state;
    render();
  }

  return response;
}

function setFeedback(message, isError = true) {
  if (!message) {
    render();
    return;
  }

  ui.activeFooter.style.color = isError ? "#b03838" : "#206b35";
  ui.activeFooter.textContent = message;
}

function getServerDisplayName(server) {
  const alias = String(server?.name || "").trim();
  if (alias) {
    return alias;
  }

  return `${server.host}:${server.port}`;
}

function updateHeaderSubtitle() {
  if (currentView === "list") {
    ui.headerSubtitle.textContent = "Selecciona un servidor";
    return;
  }

  ui.headerSubtitle.textContent =
    currentFormMode === "edit" ? "Editar servidor proxy" : "Añadir servidor proxy";
}

function hideLogsPanel() {
  ui.logsPanel.style.height = "";
  ui.logsPanel.classList.add("hidden");
  ui.app.classList.remove("hidden");
  ui.toggleLogs.classList.remove("is-active");
  ui.toggleLogs.setAttribute("aria-label", "Mostrar logs de backend");
}

function showLogsPanel() {
  const h = ui.app.offsetHeight;
  ui.app.classList.add("hidden");
  ui.logsPanel.style.height = h + "px";
  ui.logsPanel.classList.remove("hidden");
  ui.toggleLogs.classList.add("is-active");
  ui.toggleLogs.setAttribute("aria-label", "Ocultar logs de backend");
}

function createLogEntry(log) {
  const level = String(log.level || "info").toUpperCase();
  const message = String(log.message || "Sin mensaje");
  const context = log.context ? ` | ${JSON.stringify(log.context)}` : "";

  const entry = document.createElement("div");
  entry.className = "log-entry";

  const main = document.createElement("span");
  main.className = "log-main";
  main.textContent = `${level}: ${message}${context}`;

  const time = document.createElement("span");
  time.className = "log-time";
  const raw = log.time ? new Date(log.time) : null;
  time.textContent = raw && !isNaN(raw) ? raw.toLocaleString() : String(log.time || "");

  entry.append(time, main);
  return entry;
}

async function refreshLogsPanel() {
  const response = await callBackground("proxyxt/getLogs");
  const logs = Array.isArray(response.logs) ? response.logs : [];
  ui.logsContent.innerHTML = "";
  if (!logs.length) {
    ui.logsContent.textContent = "Sin logs.";
    return;
  }

  logs.forEach((log) => ui.logsContent.appendChild(createLogEntry(log)));
  ui.logsContent.lastElementChild?.scrollIntoView({ block: "end" });
}

function showListView() {
  currentView = "list";
  ui.listPanel.classList.remove("hidden");
  ui.formPanel.classList.add("hidden");
  ui.appFooter.classList.remove("hidden");
  ui.toggleViewButton.textContent = "+";
  ui.toggleViewButton.setAttribute("aria-label", "Agregar servidor");
  updateHeaderSubtitle();
}

function showFormView() {
  currentView = "form";
  ui.listPanel.classList.add("hidden");
  ui.formPanel.classList.remove("hidden");
  ui.appFooter.classList.add("hidden");
  hideLogsPanel();
  ui.toggleViewButton.textContent = "←";
  ui.toggleViewButton.setAttribute("aria-label", "Volver al listado");
  updateHeaderSubtitle();
}

function resetForm() {
  ui.serverId.value = "";
  ui.proxyForm.reset();
  ui.scheme.value = "http";
  ui.submitButton.textContent = "Guardar servidor";
  ui.deleteServer.classList.add("hidden");
}

function fillForm(server) {
  ui.serverId.value = server.id;
  ui.name.value = server.name;
  ui.scheme.value = server.scheme;
  ui.host.value = server.host;
  ui.port.value = server.port;
  ui.bypassList.value = server.bypassList || "";
  ui.submitButton.textContent = "Guardar cambios";
  ui.deleteServer.classList.remove("hidden");
}

function openFormForNewServer() {
  currentFormMode = "new";
  resetForm();
  showFormView();
}

function openFormForEdit(server) {
  currentFormMode = "edit";
  fillForm(server);
  showFormView();
}

function closeFormView() {
  currentFormMode = "new";
  showListView();
  resetForm();
}

function createServerItem(server) {
  const li = document.createElement("li");
  li.className = "server-item";
  if (server.id === state.activeServerId) {
    li.classList.add("is-active");
  }

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "server-main";

  const alias = String(server?.name || "").trim();
  const endpoint = `${server.scheme}://${server.host}:${server.port}`;

  const name = document.createElement("span");
  name.className = "server-name";
  name.textContent = alias || `${server.host}:${server.port}`;

  toggleBtn.append(name);
  if (alias) {
    const meta = document.createElement("span");
    meta.className = "server-meta";
    meta.textContent = endpoint;
    toggleBtn.append(meta);
  } else {
    toggleBtn.classList.add("no-meta");
  }
  toggleBtn.addEventListener("click", async () => {
    const nextServerId = server.id === state.activeServerId ? null : server.id;
    try {
      await callBackground("proxyxt/activateServer", { serverId: nextServerId });
      if (nextServerId) {
        setFeedback(`Proxy activo: ${getServerDisplayName(server)}`, false);
      } else {
        setFeedback("Proxy desactivado", false);
      }
    } catch (error) {
      setFeedback(error.message);
    }
  });

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "server-edit-btn";
  editBtn.textContent = "✎";
  editBtn.setAttribute("aria-label", `Editar ${getServerDisplayName(server)}`);
  editBtn.title = "Editar servidor";
  editBtn.addEventListener("click", () => {
    openFormForEdit(server);
    setFeedback("");
  });

  li.append(toggleBtn, editBtn);

  return li;
}

function render() {
  const active = state.servers.find((server) => server.id === state.activeServerId);
  ui.activeFooter.style.color = "";
  ui.activeFooter.textContent = `Activo: ${active ? getServerDisplayName(active) : "Sistema"}`;

  ui.serverList.innerHTML = "";
  if (!state.servers.length) {
    ui.emptyState.classList.remove("hidden");
    return;
  }

  ui.emptyState.classList.add("hidden");
  state.servers.forEach((server) => {
    ui.serverList.appendChild(createServerItem(server));
  });
}

ui.proxyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    server: {
      id: ui.serverId.value || undefined,
      name: ui.name.value,
      scheme: ui.scheme.value,
      host: ui.host.value,
      port: ui.port.value,
      bypassList: ui.bypassList.value
    }
  };

  try {
    const isEdit = Boolean(ui.serverId.value);
    await callBackground("proxyxt/saveServer", payload);
    setFeedback(isEdit ? "Servidor actualizado" : "Servidor guardado", false);
    closeFormView();
  } catch (error) {
    setFeedback(error.message);
  }
});

ui.deleteServer.addEventListener("click", async () => {
  const serverId = ui.serverId.value;
  if (!serverId) {
    return;
  }

  try {
    await callBackground("proxyxt/deleteServer", { serverId });
    setFeedback("Servidor eliminado", false);
    closeFormView();
  } catch (error) {
    setFeedback(error.message);
  }
});

ui.toggleViewButton.addEventListener("click", () => {
  if (currentView === "list") {
    openFormForNewServer();
    setFeedback("");
    return;
  }

  closeFormView();
  setFeedback("");
});

ui.toggleLogs.addEventListener("click", async () => {
  const isHidden = ui.logsPanel.classList.contains("hidden");
  if (!isHidden) {
    hideLogsPanel();
    return;
  }

  try {
    await refreshLogsPanel();
    showLogsPanel();
  } catch (error) {
    setFeedback(`No se pudieron cargar logs: ${error.message}`);
  }
});

(async () => {
  try {
    await callBackground("proxyxt/getState");
    closeFormView();
  } catch (error) {
    setFeedback(error.message);
  }
})();
