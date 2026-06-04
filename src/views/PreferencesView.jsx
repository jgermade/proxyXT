import { h } from "preact";
import { CheckboxField } from "../components/CheckboxField.jsx";
import { SelectField } from "../components/SelectField.jsx";

function languageOptionLabel(language, t) {
  if (language === "auto") return `🌐 ${t("language.auto")}`;
  if (language === "en") return `🇺🇸 ${t("language.en")}`;
  if (language === "es") return `🇪🇸 ${t("language.es")}`;
  if (language === "fr") return `🇫🇷 ${t("language.fr")}`;
  if (language === "pt") return `🇵🇹 ${t("language.pt")}`;
  return t(`language.${language}`);
}

export function PreferencesView({
  t,
  view,
  autoFailoverEnabled,
  language,
  onAutoFailoverChange,
  onLanguageChange
}) {
  return (
    <section className={`view-panel${view === "preferences" ? "" : " hidden"}`}>
      <div className="preferences-card">
        <h2>{t("preferences.title")}</h2>
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
              { value: "pt", label: languageOptionLabel("pt", t) }
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
        </div>
      </div>
    </section>
  );
}
