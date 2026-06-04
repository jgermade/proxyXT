export const defaultState = {
  activeServerId: null,
  servers: [],
  preferences: {
    autoFailoverEnabled: false,
    language: "auto",
    reloadActiveTabOnToggle: false,
    syncServersWithAccount: false
  }
};

export const initialFormState = {
  id: "",
  name: "",
  scheme: "http",
  host: "",
  port: "",
  bypassList: ""
};

export function normalizeState(state) {
  return {
    ...defaultState,
    ...(state || {}),
    servers: Array.isArray(state?.servers) ? state.servers : [],
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
