import { useMemo, useState, useEffect } from "preact/hooks";
import {
  containsPermissions,
  requestPermissions,
  sendMessage
} from "../lib/runtime.js";
import {
  defaultState,
  initialFormState,
  normalizeState,
  getServerDisplayName
} from "../lib/state.js";
import { createTranslator, resolveLanguage } from "../lib/i18n.js";

const FEEDBACK_DEFAULT_DURATION_MS = 1500;

export function useProxyApp() {
  const [state, setState] = useState(defaultState);
  const [view, setView] = useState("list");
  const [logsPanelHeight, setLogsPanelHeight] = useState(null);
  const [formMode, setFormMode] = useState("new");
  const [formData, setFormData] = useState(initialFormState);
  const [feedback, setFeedback] = useState(null);
  const [logs, setLogs] = useState([]);
  const [hasErrorLogs, setHasErrorLogs] = useState(false);
  const [isInitialStateLoading, setIsInitialStateLoading] = useState(true);
  const [hasNotificationsPermission, setHasNotificationsPermission] = useState(false);
  const [hasTabsPermission, setHasTabsPermission] = useState(false);

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
  const isFooterFeedbackError = Boolean(feedback?.isError);
  const footerStatus = state.footerStatus || null;

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

  async function handleClearLogs() {
    try {
      const response = await callBackground("proxyxt/clearLogs");
      const nextLogs = Array.isArray(response.logs) ? response.logs : [];
      setLogs(nextLogs);
      setHasErrorLogs(false);
      setFeedback({ message: t("messages.logsCleared"), isError: false });
    } catch (error) {
      setFeedback({ message: t("messages.logsClearError", { error: error.message }), isError: true });
      throw error;
    }
  }

  async function handleDismissFooterError() {
    try {
      await callBackground("proxyxt/dismissFooterError");
    } catch (error) {
      setFeedback({ message: error.message, isError: true });
    }
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
        if (isMounted) {
          const [notifGranted, tabsGranted] = await Promise.all([
            containsPermissions(["notifications"]).catch(() => false),
            containsPermissions(["tabs"]).catch(() => false)
          ]);
          setHasNotificationsPermission(notifGranted);
          setHasTabsPermission(tabsGranted);
        }
      } catch (error) {
        if (isMounted) {
          setFeedback({ message: error.message, isError: true });
        }
      } finally {
        if (isMounted) {
          setIsInitialStateLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const api = globalThis.browser ?? globalThis.chrome;
    const runtimeApi = api?.runtime;
    const onMessage = runtimeApi?.onMessage;

    if (!onMessage?.addListener) {
      return undefined;
    }

    const listener = (message) => {
      if (message?.type !== "proxyxt/stateUpdated" || !message.state) {
        return;
      }

      setState(normalizeState(message.state));
    };

    onMessage.addListener(listener);
    return () => {
      onMessage.removeListener?.(listener);
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = globalThis.setTimeout(() => {
      setFeedback(null);
    }, Number.isFinite(feedback.durationMs) ? feedback.durationMs : FEEDBACK_DEFAULT_DURATION_MS);

    return () => {
      globalThis.clearTimeout(timer);
    };
  }, [feedback]);

  useEffect(() => {
    function handleEscapeKey(event) {
      if (event.key !== "Escape") {
        return;
      }

      if (view === "form") {
        event.preventDefault();
        event.stopPropagation();
        closeForm();
        clearFeedback();
        return;
      }

      if (view === "preferences") {
        event.preventDefault();
        event.stopPropagation();
        setView("list");
        clearFeedback();
        return;
      }

      if (view === "logs") {
        event.preventDefault();
        event.stopPropagation();
        setView("list");
        setLogsPanelHeight(null);
        clearFeedback();
      }
    }

    globalThis.addEventListener("keydown", handleEscapeKey, true);
    return () => {
      globalThis.removeEventListener("keydown", handleEscapeKey, true);
    };
  }, [view]);

  function clearFeedback() {
    setFeedback(null);
  }

  function handleDismissFooterFeedback() {
    clearFeedback();
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
      bypassList: server.bypassList || "",
      selectionColor: server.selectionColor || initialFormState.selectionColor
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
        bypassList: formData.bypassList,
        selectionColor: formData.selectionColor || initialFormState.selectionColor
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

  async function handleReorderServers(sourceServerId, targetServerId) {
    const previousServers = state.servers;
    const sourceIndex = previousServers.findIndex((server) => server.id === sourceServerId);
    if (sourceIndex < 0) {
      return;
    }

    const nextServers = previousServers.slice();
    const [movedServer] = nextServers.splice(sourceIndex, 1);
    if (!movedServer) {
      return;
    }

    if (!targetServerId) {
      nextServers.push(movedServer);
    } else {
      const targetIndex = nextServers.findIndex((server) => server.id === targetServerId);
      if (targetIndex < 0) {
        nextServers.push(movedServer);
      } else {
        nextServers.splice(targetIndex, 0, movedServer);
      }
    }

    setState((current) => ({
      ...current,
      servers: nextServers
    }));

    try {
      await callBackground("proxyxt/reorderServers", { serverIds: nextServers.map((server) => server.id) });
      if (Boolean(state.preferences?.syncServersWithAccount)) {
        setFeedback({ message: t("messages.serverOrderSynced"), isError: false });
      }
    } catch (error) {
      setState((current) => ({
        ...current,
        servers: previousServers
      }));
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleUpdateUserColorPresets(userColorPresets) {
    const nextUserColorPresets = Array.isArray(userColorPresets) ? userColorPresets : [];
    const previousUserColorPresets = state.userColorPresets;

    setState((current) => ({
      ...current,
      userColorPresets: nextUserColorPresets
    }));

    try {
      await callBackground("proxyxt/updateUserColorPresets", { userColorPresets: nextUserColorPresets });
    } catch (error) {
      setState((current) => ({
        ...current,
        userColorPresets: previousUserColorPresets
      }));
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

  function handleOpenList() {
    setView("list");
    setLogsPanelHeight(null);
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
          language: state.preferences?.language || "auto",
          reloadActiveTabOnToggle: Boolean(state.preferences?.reloadActiveTabOnToggle),
          syncServersWithAccount: Boolean(state.preferences?.syncServersWithAccount),
          showFailoverNotifications: Boolean(state.preferences?.showFailoverNotifications)
        }
      });
      setFeedback({
        message: enabled ? t("messages.roundRobinEnabled") : t("messages.roundRobinDisabled"),
        isError: false
      });
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

  async function handleReloadActiveTabChange(enabled) {
    const previous = Boolean(state.preferences?.reloadActiveTabOnToggle);
    let shouldNotifyTabsPermissionGranted = false;

    if (enabled) {
      try {
        const hasTabsPermissionNow = await containsPermissions(["tabs"]);
        if (!hasTabsPermissionNow) {
          const hasNotificationsPermission = await containsPermissions(["notifications"]);
          shouldNotifyTabsPermissionGranted = hasNotificationsPermission;
          if (shouldNotifyTabsPermissionGranted) {
            await callBackground("proxyxt/setTabsPermissionNotifyPending", { pending: true });
          }

          const granted = await requestPermissions(["tabs"]);
          if (!granted) {
            if (shouldNotifyTabsPermissionGranted) {
              try {
                await callBackground("proxyxt/setTabsPermissionNotifyPending", { pending: false });
              } catch (_error) {
                // Ignore pending cleanup failures on tabs denial.
              }
            }
            setFeedback({ message: t("messages.tabsPermissionDenied"), isError: true });
            return;
          }
          setHasTabsPermission(true); // tabs granted
        }
      } catch (error) {
        if (shouldNotifyTabsPermissionGranted) {
          try {
            await callBackground("proxyxt/setTabsPermissionNotifyPending", { pending: false });
          } catch (_cleanupError) {
            // Ignore pending cleanup failures on tabs request errors.
          }
        }
        setFeedback({ message: error.message || t("messages.tabsPermissionDenied"), isError: true });
        return;
      }
    } else {
      try {
        await callBackground("proxyxt/setTabsPermissionNotifyPending", { pending: false });
      } catch (_error) {
        // Ignore pending cleanup failures on disable.
      }
    }

    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        reloadActiveTabOnToggle: enabled
      }
    }));

    try {
      await callBackground("proxyxt/updatePreferences", {
        preferences: {
          autoFailoverEnabled: Boolean(state.preferences?.autoFailoverEnabled),
          language: state.preferences?.language || "auto",
          reloadActiveTabOnToggle: enabled,
          syncServersWithAccount: Boolean(state.preferences?.syncServersWithAccount),
          showFailoverNotifications: Boolean(state.preferences?.showFailoverNotifications)
        }
      });

      setFeedback({
        message: enabled ? t("messages.reloadOnToggleEnabled") : t("messages.reloadOnToggleDisabled"),
        isError: false
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          reloadActiveTabOnToggle: previous
        }
      }));
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleSyncServersWithAccountChange(enabled) {
    const previous = Boolean(state.preferences?.syncServersWithAccount);

    if (enabled) {
      setFeedback({ message: t("messages.syncServersInProgress"), isError: false, durationMs: 30000 });
    }

    setState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        syncServersWithAccount: enabled
      }
    }));

    try {
      await callBackground("proxyxt/updatePreferences", {
        preferences: {
          autoFailoverEnabled: Boolean(state.preferences?.autoFailoverEnabled),
          language: state.preferences?.language || "auto",
          reloadActiveTabOnToggle: Boolean(state.preferences?.reloadActiveTabOnToggle),
          syncServersWithAccount: enabled,
          showFailoverNotifications: Boolean(state.preferences?.showFailoverNotifications)
        }
      });
      setFeedback({
        message: enabled ? t("messages.syncServersEnabled") : t("messages.syncServersDisabled"),
        isError: false
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          syncServersWithAccount: previous
        }
      }));
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleShowFailoverNotificationsChange(enabled) {
    const previous = Boolean(state.preferences?.showFailoverNotifications);
    const shouldEnable = Boolean(enabled);

    if (shouldEnable) {
      try {
        const hasNotificationsPermission = await containsPermissions(["notifications"]);
        if (!hasNotificationsPermission) {
          await callBackground("proxyxt/setNotificationsEnablePending", { pending: true });
          const granted = await requestPermissions(["notifications"]);
          if (!granted) {
            try {
              await callBackground("proxyxt/setNotificationsEnablePending", { pending: false });
            } catch (_error) {
              // Ignore cleanup failures when permission is denied.
            }
            setFeedback({ message: t("messages.notificationsPermissionDenied"), isError: true });
            return;
          }
          setHasNotificationsPermission(true);
        }
      } catch (error) {
        try {
          await callBackground("proxyxt/setNotificationsEnablePending", { pending: false });
        } catch (_cleanupError) {
          // Ignore cleanup failures when request flow throws.
        }
        setFeedback({ message: error.message || t("messages.notificationsPermissionDenied"), isError: true });
        return;
      }
    }

    try {
      setState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          showFailoverNotifications: shouldEnable
        }
      }));

      if (shouldEnable) {
        await callBackground("proxyxt/enableFailoverNotifications");
      } else {
        await callBackground("proxyxt/setNotificationsEnablePending", { pending: false });
        await callBackground("proxyxt/updatePreferences", {
          preferences: {
            autoFailoverEnabled: Boolean(state.preferences?.autoFailoverEnabled),
            language: state.preferences?.language || "auto",
            reloadActiveTabOnToggle: Boolean(state.preferences?.reloadActiveTabOnToggle),
            syncServersWithAccount: Boolean(state.preferences?.syncServersWithAccount),
            showFailoverNotifications: false
          }
        });
      }

      setFeedback({
        message: shouldEnable ? t("messages.failoverNotificationsEnabled") : t("messages.failoverNotificationsDisabled"),
        isError: false
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        preferences: {
          ...current.preferences,
          showFailoverNotifications: previous
        }
      }));
      setFeedback({ message: error.message, isError: true });
    }
  }

  async function handleLanguageChange(language) {
    const previous = state.preferences?.language || "auto";
    const nextLanguage = ["auto", "en", "es", "fr", "pt", "it", "de"].includes(language)
      ? language
      : "auto";
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
          language: nextLanguage,
          reloadActiveTabOnToggle: Boolean(state.preferences?.reloadActiveTabOnToggle),
          syncServersWithAccount: Boolean(state.preferences?.syncServersWithAccount),
          showFailoverNotifications: Boolean(state.preferences?.showFailoverNotifications)
        }
      });
      const explicitLanguageName =
        nextLanguage === "auto"
          ? nextT(`language.${nextEffectiveLanguage}`)
          : nextT(`language.${nextLanguage}`);
      const languageMessage =
        nextLanguage === "auto"
          ? nextT("messages.languageChangedAuto", { language: explicitLanguageName })
          : nextT("messages.languageChanged", { language: explicitLanguageName });

      setFeedback({ message: languageMessage, isError: false });
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

  function handleLogsFeedback(message, isError = false, durationMs) {
    setFeedback({
      message,
      isError: Boolean(isError),
      durationMs: Number.isFinite(durationMs) ? durationMs : undefined
    });
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
    isFooterFeedbackError,
    footerStatus,
    logs,
    logsPanelHeight,
    hasErrorLogs,
    isInitialStateLoading,
    servers: state.servers,
    userColorPresets: state.userColorPresets,
    activeServerId: state.activeServerId,
    autoFailoverEnabled: state.preferences?.autoFailoverEnabled,
    reloadActiveTabOnToggle: state.preferences?.reloadActiveTabOnToggle,
    syncServersWithAccount: state.preferences?.syncServersWithAccount,
    showFailoverNotifications: state.preferences?.showFailoverNotifications,
    hasNotificationsPermission,
    hasTabsPermission,
    languagePreference,
    effectiveLanguage,
    handlePrimaryAction,
    handleOpenList,
    handleOpenPreferences,
    handleTogglePreferences,
    handleToggleLogs,
    handleClearLogs,
    handleLogsFeedback,
    handleDismissFooterError,
    handleDismissFooterFeedback,
    handleToggleServer,
    openFormForEdit,
    handleSubmitForm,
    handleDeleteServer,
    handleReorderServers,
    handleUpdateUserColorPresets,
    handleAutoFailoverChange,
    handleReloadActiveTabChange,
    handleSyncServersWithAccountChange,
    handleShowFailoverNotificationsChange,
    handleLanguageChange
  };
}
