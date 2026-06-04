import { h } from "preact";
import { CheckboxField } from "../components/CheckboxField.jsx";
import { SelectField } from "../components/SelectField.jsx";

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
  language,
  onAutoFailoverChange,
  onReloadActiveTabChange,
  onSyncServersWithAccountChange,
  onLanguageChange
}) {
  return (
    <section className={`view-panel${view === "preferences" ? "" : " hidden"}`}>
      <div className="preferences-card">
        <div className="preferences-group">
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
        </div>

        <div className="preferences-separator" aria-hidden="true" />

        <div className="preferences-group">
          <CheckboxField
            id="autoFailoverEnabled"
            className="preferences-toggle"
            checked={Boolean(autoFailoverEnabled)}
            onChange={onAutoFailoverChange}
            label={t("labels.autoFailover")}
          />
          <p className="preferences-help">{t("preferences.help")}</p>

          <CheckboxField
            id="reloadActiveTabOnToggle"
            className="preferences-toggle"
            checked={Boolean(reloadActiveTabOnToggle)}
            onChange={onReloadActiveTabChange}
            label={t("labels.reloadActiveTabOnToggle")}
          />
          <p className="preferences-help">{t("preferences.reloadHelp")}</p>

          <CheckboxField
            id="syncServersWithAccount"
            className="preferences-toggle"
            checked={Boolean(syncServersWithAccount)}
            onChange={onSyncServersWithAccountChange}
            label={t("labels.syncServersWithAccount")}
          />
          <p className="preferences-help">{t("preferences.syncHelp")}</p>
        </div>
      </div>
    </section>
  );
}
