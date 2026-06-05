import { Fragment, h } from "preact";
import { useRef } from "preact/hooks";
import { AddBackButton } from "./components/AddBackButton.jsx";
import { LanguageBadge } from "./components/LanguageBadge.jsx";
import { LogsSvg } from "./components/icons/LogsSvg.jsx";
import { PreferencesSvg } from "./components/icons/PreferencesSvg.jsx";
import { useProxyApp } from "./hooks/useProxyApp.js";
import { getServerDisplayName } from "./lib/state.js";
import { LogsView } from "./views/logs/LogsView.jsx";
import { ListView } from "./views/list/ListView.jsx";
import { FormView } from "./views/form/FormView.jsx";
import { PreferencesView } from "./views/preferences/PreferencesView.jsx";

export function App() {
  const mainRef = useRef(null);

  const {
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
    servers,
    activeServerId,
    autoFailoverEnabled,
    reloadActiveTabOnToggle,
    syncServersWithAccount,
    languagePreference,
    effectiveLanguage,
    handlePrimaryAction,
    handleOpenList,
    handleOpenPreferences,
    handleTogglePreferences,
    handleToggleLogs,
    handleToggleServer,
    openFormForEdit,
    handleSubmitForm,
    handleDeleteServer,
    handleAutoFailoverChange,
    handleReloadActiveTabChange,
    handleSyncServersWithAccountChange,
    handleLanguageChange
  } = useProxyApp();

  const stackedStyle = view === "logs" && logsPanelHeight ? { height: `${logsPanelHeight}px` } : undefined;

  return (
    <Fragment>
      <div className={`content-stack${view === "logs" ? " is-logs" : ""}`} style={stackedStyle}>
        <LogsView t={t} logs={logs} />

        <main ref={mainRef} className="app">
          <header className="app-header">
            <div
              className="app-header-home"
              role="button"
              tabIndex={0}
              onClick={handleOpenList}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenList();
                }
              }}
            >
              <h1>{t("app.title")}</h1>
              <p id="headerSubtitle">{subtitle}</p>
            </div>
            <div className="header-actions">
              <AddBackButton
                variant="icon"
                className="header-option-btn"
                active={view === "preferences"}
                ariaLabel={view === "preferences" ? t("buttons.preferences.hide") : t("buttons.preferences.show")}
                title={t("preferences.title")}
                onClick={handleTogglePreferences}
              >
                <PreferencesSvg />
              </AddBackButton>

              <AddBackButton
                variant="plusToggle"
                view={view === "form" ? "form" : "list"}
                onClick={handlePrimaryAction}
                ariaLabel={view === "form" ? t("buttons.server.backToList") : t("buttons.server.add")}
              />
            </div>
          </header>

          <ListView
            t={t}
            view={view}
            servers={servers}
            activeServerId={activeServerId}
            onToggle={handleToggleServer}
            onEdit={openFormForEdit}
            getServerDisplayName={getServerDisplayName}
          />

          <FormView
            t={t}
            view={view}
            formMode={formMode}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmitForm}
            onDelete={handleDeleteServer}
          />

          <PreferencesView
            t={t}
            view={view}
            autoFailoverEnabled={autoFailoverEnabled}
            reloadActiveTabOnToggle={reloadActiveTabOnToggle}
            syncServersWithAccount={syncServersWithAccount}
            language={languagePreference}
            onAutoFailoverChange={handleAutoFailoverChange}
            onReloadActiveTabChange={handleReloadActiveTabChange}
            onSyncServersWithAccountChange={handleSyncServersWithAccountChange}
            onLanguageChange={handleLanguageChange}
          />
        </main>
      </div>

      <footer className={`app-footer${view === "form" ? " hidden" : ""}`}>
        {footerFeedbackMessage ? (
          <span id="activeFooter" style={footerFeedbackStyle}>
            {footerFeedbackMessage}
          </span>
        ) : (
          <span id="activeFooter" className="footer-proxy-status" onClick={handleOpenList}>
            <span className="footer-proxy-label">{t("footer.proxyLabel")}</span>
            <span className={`footer-proxy-value${activeServerId ? " is-active" : ""}`}> {activeProxyDisplay}</span>
          </span>
        )}

        <div className="footer-actions">
          <LanguageBadge
            preference={languagePreference}
            effectiveLanguage={effectiveLanguage}
            t={t}
            onClick={handleOpenPreferences}
          />

          <AddBackButton
            variant="icon"
            className="footer-btn"
            active={view === "logs"}
            hasError={hasErrorLogs}
            ariaLabel={view === "logs" ? t("buttons.logs.hide") : t("buttons.logs.show")}
            title={t("buttons.logs.title")}
            onClick={() => {
              const height = mainRef.current?.offsetHeight || 0;
              handleToggleLogs(height);
            }}
          >
            <LogsSvg />
          </AddBackButton>
        </div>
      </footer>
    </Fragment>
  );
}
