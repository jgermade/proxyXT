import { Fragment, h } from "preact";
import { useRef } from "preact/hooks";
import { AddBackButton } from "./components/AddBackButton.jsx";
import { LanguageBadge } from "./components/LanguageBadge.jsx";
import { useProxyApp } from "./hooks/useProxyApp.js";
import { getServerDisplayName } from "./lib/state.js";
import { LogsView } from "./views/LogsView.jsx";
import { ListView } from "./views/ListView.jsx";
import { FormView } from "./views/FormView.jsx";
import { PreferencesView } from "./views/PreferencesView.jsx";

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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.544-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.544-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.544.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.544.826-3.31 2.37-2.37.996.607 2.296.07 2.573-1.066Z"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <circle cx="12" cy="12" r="3.2" stroke="currentColor" stroke-width="1.7" />
                </svg>
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
            language={languagePreference}
            onAutoFailoverChange={handleAutoFailoverChange}
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
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M12 8.2c-2.87 0-5.2 2.33-5.2 5.2v2.1c0 2.87 2.33 5.2 5.2 5.2s5.2-2.33 5.2-5.2v-2.1c0-2.87-2.33-5.2-5.2-5.2Z"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path d="M12 8.2V5.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M9.2 4.6 12 5.5l2.8-.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M7.1 11.2 4.5 9.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M16.9 11.2 19.5 9.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M7.1 14.7 4.5 14.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
              <path d="M16.9 14.7h2.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
            </svg>
          </AddBackButton>
        </div>
      </footer>
    </Fragment>
  );
}
