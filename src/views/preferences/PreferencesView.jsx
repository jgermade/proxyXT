import { h } from "preact";
import { SelectField } from "../../components/form/SelectField.jsx";
import {
  PreferenceToggle,
  PreferencesCard,
  PreferencesGroup,
  PreferencesHelp,
  PreferencesPanel,
  PreferencesSeparator
} from "./PreferencesView.styles.jsx";

function languageOptionLabel(language, t) {
  if (language === "auto") return `🌐 ${t("language.auto")}`;
  if (language === "en") return `🇺🇸 ${t("language.en")}`;
  if (language === "es") return `🇪🇸 ${t("language.es")}`;
  if (language === "fr") return `🇫🇷 ${t("language.fr")}`;
  if (language === "pt") return `🇵🇹 ${t("language.pt")}`;
  if (language === "it") return `🇮🇹 ${t("language.it")}`;
  if (language === "de") return `🇩🇪 ${t("language.de")}`;
  return t(`language.${language}`);
}

export function PreferencesView({
  t,
  view,
  autoFailoverEnabled,
  reloadActiveTabOnToggle,
  syncServersWithAccount,
  showFailoverNotifications,
  language,
  onAutoFailoverChange,
  onReloadActiveTabChange,
  onSyncServersWithAccountChange,
  onShowFailoverNotificationsChange,
  onLanguageChange
}) {
  return (
    <PreferencesPanel $isVisible={view === "preferences"}>
      <PreferencesCard>
        <PreferencesGroup>
          <SelectField
            id="language"
            label={t("labels.language")}
            value={language || "auto"}
            onChange={onLanguageChange}
            options={[
              { value: "auto", label: languageOptionLabel("auto", t) },
              { value: "en", label: languageOptionLabel("en", t) },
              { value: "es", label: languageOptionLabel("es", t) },
              { value: "fr", label: languageOptionLabel("fr", t) },
              { value: "pt", label: languageOptionLabel("pt", t) },
              { value: "it", label: languageOptionLabel("it", t) },
              { value: "de", label: languageOptionLabel("de", t) }
            ]}
          />
        </PreferencesGroup>

        <PreferencesSeparator aria-hidden="true" />

        <PreferencesGroup>
          <PreferenceToggle
            id="autoFailoverEnabled"
            checked={Boolean(autoFailoverEnabled)}
            onChange={onAutoFailoverChange}
            label={t("labels.autoFailover")}
          />
          <PreferencesHelp>{t("preferences.help")}</PreferencesHelp>

          <PreferenceToggle
            id="reloadActiveTabOnToggle"
            checked={Boolean(reloadActiveTabOnToggle)}
            onChange={onReloadActiveTabChange}
            label={t("labels.reloadActiveTabOnToggle")}
          />
          <PreferencesHelp>{t("preferences.reloadHelp")}</PreferencesHelp>

          <PreferenceToggle
            id="syncServersWithAccount"
            checked={Boolean(syncServersWithAccount)}
            onChange={onSyncServersWithAccountChange}
            label={t("labels.syncServersWithAccount")}
          />
          <PreferencesHelp>{t("preferences.syncHelp")}</PreferencesHelp>

          <PreferenceToggle
            id="showFailoverNotifications"
            checked={Boolean(showFailoverNotifications)}
            onChange={onShowFailoverNotificationsChange}
            label={t("labels.showFailoverNotifications")}
          />
          <PreferencesHelp>{t("preferences.failoverNotificationsHelp")}</PreferencesHelp>
        </PreferencesGroup>
      </PreferencesCard>
    </PreferencesPanel>
  );
}
