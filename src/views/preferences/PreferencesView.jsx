import { h } from "preact";
import { useMemo, useState } from "preact/hooks";
import { PreferencesSvg } from "../../components/icons/PreferencesSvg.jsx";
import { SelectField } from "../../components/form/SelectField.jsx";
import {
  PreferenceToggle,
  PreferencesCard,
  PreferencesGroup,
  PreferencesHintBox,
  PreferencesHintPlaceholder,
  PreferencesHintText,
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
  const [hoveredPreferenceId, setHoveredPreferenceId] = useState(null);
  const preferenceHintById = useMemo(() => ({
    syncServersWithAccount: t("preferences.syncHelp"),
    autoFailoverEnabled: t("preferences.help"),
    reloadActiveTabOnToggle: t("preferences.reloadHelp"),
    showFailoverNotifications: t("preferences.failoverNotificationsHelp")
  }), [t]);
  const activeHint = hoveredPreferenceId ? preferenceHintById[hoveredPreferenceId] : "";

  function preferenceHoverHandlers(id) {
    return {
      onMouseEnter: () => setHoveredPreferenceId(id),
      onFocusIn: () => setHoveredPreferenceId(id),
      onMouseLeave: () => setHoveredPreferenceId((current) => (current === id ? null : current)),
      onFocusOut: () => setHoveredPreferenceId((current) => (current === id ? null : current))
    };
  }

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
          <div {...preferenceHoverHandlers("syncServersWithAccount")}>
            <PreferenceToggle
              id="syncServersWithAccount"
              checked={Boolean(syncServersWithAccount)}
              onChange={onSyncServersWithAccountChange}
              label={t("labels.syncData")}
            />
          </div>

          <div {...preferenceHoverHandlers("autoFailoverEnabled")}>
            <PreferenceToggle
              id="autoFailoverEnabled"
              checked={Boolean(autoFailoverEnabled)}
              onChange={onAutoFailoverChange}
              label={t("labels.autoFailoverSimple")}
            />
          </div>

          <div {...preferenceHoverHandlers("showFailoverNotifications")}>
            <PreferenceToggle
              id="showFailoverNotifications"
              checked={Boolean(showFailoverNotifications)}
              onChange={onShowFailoverNotificationsChange}
              label={t("labels.showNotifications")}
              badge={t("labels.permissionBadge")}
              badgeTitle={t("labels.permissionBadgeNotificationsTitle")}
            />
          </div>

          <div {...preferenceHoverHandlers("reloadActiveTabOnToggle")}>
            <PreferenceToggle
              id="reloadActiveTabOnToggle"
              checked={Boolean(reloadActiveTabOnToggle)}
              onChange={onReloadActiveTabChange}
              label={t("labels.autoReloadTab")}
              badge={t("labels.permissionBadge")}
              badgeTitle={t("labels.permissionBadgeTabsTitle")}
            />
          </div>

          <PreferencesHintBox aria-live="polite">
            <PreferencesHintPlaceholder aria-hidden="true" $isHintActive={Boolean(activeHint)}>
              <PreferencesSvg size={48} />
            </PreferencesHintPlaceholder>
            <PreferencesHintText>{activeHint || " "}</PreferencesHintText>
          </PreferencesHintBox>
        </PreferencesGroup>
      </PreferencesCard>
    </PreferencesPanel>
  );
}
