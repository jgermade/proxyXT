import { Fragment, h } from "preact";
import { useRef } from "preact/hooks";
import { useProxyApp } from "./hooks/useProxyApp.js";
import { LogsView } from "./views/logs/LogsView.jsx";
import { AppFooter } from "./layout/footer/AppFooter.jsx";
import { AppMain } from "./layout/main/AppMain.jsx";
import { ContentStack } from "./layout/main/ContentStack.jsx";
import { LogsLayer } from "./layout/main/LogsLayer.jsx";

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
    isFooterFeedbackError,
    logs,
    logsPanelHeight,
    hasErrorLogs,
    isInitialStateLoading,
    servers,
    userColorPresets,
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
    handleClearLogs,
    handleLogsFeedback,
    handleToggleServer,
    openFormForEdit,
    handleReorderServers,
    handleUpdateUserColorPresets,
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
      <ContentStack style={stackedStyle}>
        <LogsLayer isVisible={view === "logs"}>
          <LogsView
            t={t}
            logs={logs}
            onClose={handleOpenList}
            onClearLogs={handleClearLogs}
            onFeedback={handleLogsFeedback}
          />
        </LogsLayer>

        <AppMain
          mainRef={mainRef}
          className="app-main"
          isHidden={view === "logs"}
          t={t}
          subtitle={subtitle}
          view={view}
          isInitialStateLoading={isInitialStateLoading}
          handleOpenList={handleOpenList}
          handleTogglePreferences={handleTogglePreferences}
          handlePrimaryAction={handlePrimaryAction}
          servers={servers}
          userColorPresets={userColorPresets}
          activeServerId={activeServerId}
          handleToggleServer={handleToggleServer}
          handleReorderServers={handleReorderServers}
          openFormForEdit={openFormForEdit}
          formMode={formMode}
          formData={formData}
          setFormData={setFormData}
          handleUpdateUserColorPresets={handleUpdateUserColorPresets}
          handleSubmitForm={handleSubmitForm}
          handleDeleteServer={handleDeleteServer}
          autoFailoverEnabled={autoFailoverEnabled}
          reloadActiveTabOnToggle={reloadActiveTabOnToggle}
          syncServersWithAccount={syncServersWithAccount}
          languagePreference={languagePreference}
          handleAutoFailoverChange={handleAutoFailoverChange}
          handleReloadActiveTabChange={handleReloadActiveTabChange}
          handleSyncServersWithAccountChange={handleSyncServersWithAccountChange}
          handleLanguageChange={handleLanguageChange}
        />
      </ContentStack>

      <AppFooter
        isHidden={view === "form"}
        footerFeedbackMessage={footerFeedbackMessage}
        isFooterFeedbackError={isFooterFeedbackError}
        handleOpenList={handleOpenList}
        t={t}
        activeServerId={activeServerId}
        activeProxyDisplay={activeProxyDisplay}
        languagePreference={languagePreference}
        effectiveLanguage={effectiveLanguage}
        handleOpenPreferences={handleOpenPreferences}
        view={view}
        hasErrorLogs={hasErrorLogs}
        onToggleLogs={() => {
          const height = mainRef.current?.offsetHeight || 0;
          handleToggleLogs(height);
        }}
      />
    </Fragment>
  );
}
