import { useMemo, useState, useEffect } from "preact/hooks";
import { sendMessage } from "../lib/runtime.js";
import {
  defaultState,
  initialFormState,
  normalizeState,
  getServerDisplayName
} from "../lib/state.js";
import { createTranslator, resolveLanguage } from "../lib/i18n.js";

export function useProxyApp() {
  const [state, setState] = useState(defaultState);
  const [view, setView] = useState("list");
  const [logsPanelHeight, setLogsPanelHeight] = useState(null);
  const [formMode, setFormMode] = useState("new");
  const [formData, setFormData] = useState(initialFormState);
  const [feedback, setFeedback] = useState(null);
  const [logs, setLogs] = useState([]);
  const [hasErrorLogs, setHasErrorLogs] = useState(false);

  const languagePreference = state.preferences?.language || "auto";
  const effectiveLanguage = resolveLanguage(languagePreference, globalThis.navigator?.language);
  const t = useMemo(() => createTranslator(effectiveLanguage), [effectiveLanguage]);

  const activeServer = useMemo(() => {
    return state.servers.find((server) => server.id === state.activeServerId) || null;
  }, [state.servers, state.activeServerId]);

  const subtitle =
    view === "form"
      ? formMode === "edit"
        ? t("app.subtitle.editProxy")
        : t("app.subtitle.addProxy")
      : view === "preferences"
        ? t("app.subtitle.preferences")
        : t("app.subtitle.selectServer");

  const activeProxyDisplay = activeServer
    ? `${activeServer.host}:${activeServer.port}`
    : t("footer.system");
  const footerFeedbackMessage = feedback?.message || null;
  const footerFeedbackStyle = feedback ? { color: feedback.isError ? "#b03838" : "#206b35" } : {};

  async function callBackground(type, payload = {}) {
    const response = await sendMessage({ type, payload });
    if (!response?.ok) {
      throw new Error(response?.error || t("messages.unknownError"));
    }

    if (response.state) {
      setState(normalizeState(response.state));
    }

    return response;
  }

  async function refreshLogs() {
    const response = await callBackground("proxyxt/getLogs");
    const data = Array.isArray(response.logs) ? response.logs : [];
    setLogs(data);
    setHasErrorLogs(data.some((log) => log.level === "error"));
  }

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const response = await callBackground("proxyxt/getState");
        if (isMounted && response.state) {
          setState(normalizeState(response.state));
        }
        if (isMounted) {
          await refreshLogs();
        }
      } catch (error) {
        if (isMounted) {
          setFeedback({ message: error.message, isError: true });
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = globalThis.setTimeout(() => {
      setFeedback(null);
    }, 3000);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [feedback]);

  function clearFeedback() {
    setFeedback(null);
  }

  function openFormForNewServer() {
    setFormMode("new");
    setFormData({ ...initialFormState });
    setView("form");
    clearFeedback();
  }

  function openFormForEdit(server) {
    setFormMode("edit");
    setFormData({
      id: server.id,
      name: server.name,
      scheme: server.scheme,
      host: server.host,
      port: server.port,
      bypassList: server.bypassList || ""
    });
    setView("form");
    clearFeedback();
  }

  function closeForm() {
    setFormMode("new");
    setFormData({ ...initialFormState });
    setView("list");
  }

  function handlePrimaryAction() {
    if (view === "form") {
      closeForm();
      clearFeedback();
      return;
    }

    openFormForNewServer();
  }

  async function handleToggleServer(server) {
    const nextServerId = server.id === state.activeServerId ? null : server.id;
    try {
      await callBackground("proxyxt/activateServer", { serverId: nextServerId });
      setFeedback(null);
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleSubmitForm(event) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const payload = {
      server: {
        id: formData.id || undefined,
        name: formData.name,
        scheme: formData.scheme,
        host: formData.host,
        port: formData.port,
        bypassList: formData.bypassList
      }
    };

    try {
      const isEdit = Boolean(formData.id);
      await callBackground("proxyxt/saveServer", payload);
      setFeedback({ message: isEdit ? t("messages.serverUpdated") : t("messages.serverSaved"), isError: false });
      closeForm();
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleDeleteServer() {
    if (!formData.id) {
      return;
    }

    try {
      await callBackground("proxyxt/deleteServer", { serverId: formData.id });
      setFeedback({ message: t("messages.serverDeleted"), isError: false });
      closeForm();
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
  }

  function handleTogglePreferences() {
    if (view === "preferences") {
      setView("list");
      return;
    }

    setView("preferences");
    clearFeedback();
  }

  function handleOpenPreferences() {
    setView("preferences");
    clearFeedback();
  }

  async function handleToggleLogs(mainHeight) {
    if (view === "logs") {
      setView("list");
      setLogsPanelHeight(null);
      return;
    }

    if (typeof mainHeight === "number" && mainHeight > 0) {
      setLogsPanelHeight(mainHeight);
    }

    try {
      await refreshLogs();
      setView("logs");
    } catch (error) {
      setLogsPanelHeight(null);
      setFeedback({ message: t("messages.logsLoadError", { error: error.message }), isError: true });
    }
  }

  async function handleAutoFailoverChange(enabled) {
    const previous = Boolean(state.preferences?.autoFailoverEnabled);
    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        autoFailoverEnabled: enabled
      }
    }));

    try {
      await callBackground("proxyxt/updatePreferences", {
        preferences: {
          autoFailoverEnabled: enabled,
          language: state.preferences?.language || "auto"
        }
      });
      setFeedback({ message: t("messages.preferencesSaved"), isError: false });
    } catch (error) {
      setState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          autoFailoverEnabled: previous
        }
      }));
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleLanguageChange(language) {
    const previous = state.preferences?.language || "auto";
    const nextLanguage = ["auto", "en", "es", "fr", "pt"].includes(language) ? language : "auto";
    const nextEffectiveLanguage = resolveLanguage(nextLanguage, globalThis.navigator?.language);
    const nextT = createTranslator(nextEffectiveLanguage);

    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        language: nextLanguage
      }
    }));

    try {
      await callBackground("proxyxt/updatePreferences", {
        preferences: {
          autoFailoverEnabled: Boolean(state.preferences?.autoFailoverEnabled),
          language: nextLanguage
        }
      });
      setFeedback({ message: nextT("messages.preferencesSaved"), isError: false });
    } catch (error) {
      setState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          language: previous
        }
      }));
      setFeedback({ message: error.message, isError: true });
    }
  }

  return {
    t,
    view,
    formMode,
    formData,
    setFormData,
    subtitle,
    activeProxyDisplay,
    footerFeedbackMessage,
    footerFeedbackStyle,
    logs,
    logsPanelHeight,
    hasErrorLogs,
    servers: state.servers,
    activeServerId: state.activeServerId,
    autoFailoverEnabled: state.preferences?.autoFailoverEnabled,
    languagePreference,
    effectiveLanguage,
    handlePrimaryAction,
    handleOpenPreferences,
    handleTogglePreferences,
    handleToggleLogs,
    handleToggleServer,
    openFormForEdit,
    handleSubmitForm,
    handleDeleteServer,
    handleAutoFailoverChange,
    handleLanguageChange
  };
}
