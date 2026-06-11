import { h } from "preact";
import { getServerDisplayName } from "../../lib/state.js";
import { FormView } from "../../views/form/FormView.jsx";
import { ListView } from "../../views/list/ListView.jsx";
import { PreferencesView } from "../../views/preferences/PreferencesView.jsx";
import { AppHeader } from "../header/AppHeader.jsx";
import { StyledAppMain } from "./AppMain.styles.jsx";

export function AppMain({
  className,
  isHidden = false,
  mainRef,
  t,
  subtitle,
  view,
  isInitialStateLoading,
  handleOpenList,
  handleTogglePreferences,
  handlePrimaryAction,
  servers,
  userColorPresets,
  activeServerId,
  handleToggleServer,
  handleReorderServers,
  openFormForEdit,
  formMode,
  formData,
  setFormData,
  handleUpdateUserColorPresets,
  handleSubmitForm,
  handleDeleteServer,
  autoFailoverEnabled,
  reloadActiveTabOnToggle,
  syncServersWithAccount,
  showFailoverNotifications,
  hasNotificationsPermission,
  hasTabsPermission,
  languagePreference,
  handleAutoFailoverChange,
  handleReloadActiveTabChange,
  handleSyncServersWithAccountChange,
  handleShowFailoverNotificationsChange,
  handleLanguageChange,
  handleOpenPreferences
}) {
  return (
    <StyledAppMain ref={mainRef} className={className} $isHidden={isHidden}>
      <AppHeader
        t={t}
        subtitle={subtitle}
        view={view}
        handleOpenList={handleOpenList}
        handleTogglePreferences={handleTogglePreferences}
        handlePrimaryAction={handlePrimaryAction}
      />

      <ListView
        t={t}
        view={view}
        isInitialStateLoading={isInitialStateLoading}
        servers={servers}
        activeServerId={activeServerId}
        onToggle={handleToggleServer}
        onReorder={handleReorderServers}
        onEdit={openFormForEdit}
        getServerDisplayName={getServerDisplayName}
        onAddServer={handlePrimaryAction}
        syncServersWithAccount={syncServersWithAccount}
        onActivateSync={() => handleSyncServersWithAccountChange(true)}
      />

      <FormView
        t={t}
        view={view}
        formMode={formMode}
        formData={formData}
        setFormData={setFormData}
        userColorPresets={userColorPresets}
        onUpdateUserColorPresets={handleUpdateUserColorPresets}
        onSubmit={handleSubmitForm}
        onDelete={handleDeleteServer}
      />

      <PreferencesView
        t={t}
        view={view}
        autoFailoverEnabled={autoFailoverEnabled}
        reloadActiveTabOnToggle={reloadActiveTabOnToggle}
        syncServersWithAccount={syncServersWithAccount}
        showFailoverNotifications={showFailoverNotifications}
        hasNotificationsPermission={hasNotificationsPermission}
        hasTabsPermission={hasTabsPermission}
        language={languagePreference}
        onAutoFailoverChange={handleAutoFailoverChange}
        onReloadActiveTabChange={handleReloadActiveTabChange}
        onSyncServersWithAccountChange={handleSyncServersWithAccountChange}
        onShowFailoverNotificationsChange={handleShowFailoverNotificationsChange}
        onLanguageChange={handleLanguageChange}
      />
    </StyledAppMain>
  );
}