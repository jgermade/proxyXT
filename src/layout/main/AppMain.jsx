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
  handleOpenList,
  handleTogglePreferences,
  handlePrimaryAction,
  servers,
  activeServerId,
  handleToggleServer,
  openFormForEdit,
  formMode,
  formData,
  setFormData,
  handleSubmitForm,
  handleDeleteServer,
  autoFailoverEnabled,
  syncServersWithAccount,
  languagePreference,
  handleAutoFailoverChange,
  handleSyncServersWithAccountChange,
  handleLanguageChange
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
        servers={servers}
        activeServerId={activeServerId}
        onToggle={handleToggleServer}
        onEdit={openFormForEdit}
        getServerDisplayName={getServerDisplayName}
        onAddServer={handlePrimaryAction}
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
        syncServersWithAccount={syncServersWithAccount}
        language={languagePreference}
        onAutoFailoverChange={handleAutoFailoverChange}
        onSyncServersWithAccountChange={handleSyncServersWithAccountChange}
        onLanguageChange={handleLanguageChange}
      />
    </StyledAppMain>
  );
}