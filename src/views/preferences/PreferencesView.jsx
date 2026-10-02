import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { PreferencesSvg } from "../../components/icons/PreferencesSvg.jsx";
import { SelectField } from "../../components/form/SelectField.jsx";
import {
  PreferenceToggle,
  PreferencesForm,
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
  hasNotificationsPermission,
  hasTabsPermission,
  language,
  onAutoFailoverChange,
  onReloadActiveTabChange,
  onSyncServersWithAccountChange,
  onShowFailoverNotificationsChange,
  onLanguageChange
}) {
  const [hoveredPreferenceId, setHoveredPreferenceId] = useState(null);
  const [isHintGearBoosted, setIsHintGearBoosted] = useState(false);
  const hintBoostTimerRef = useRef(null);
  const preferenceHintById = useMemo(() => ({
    syncServersWithAccount: t("preferences.syncHelp"),
    autoFailoverEnabled: t("preferences.help"),
    reloadActiveTabOnToggle: t("preferences.reloadHelp"),
    showFailoverNotifications: t("preferences.failoverNotificationsHelp")
  }), [t]);
  const activeHint = hoveredPreferenceId ? preferenceHintById[hoveredPreferenceId] : "";

  useEffect(() => {
    return () => {
      if (hintBoostTimerRef.current) {
        globalThis.clearTimeout(hintBoostTimerRef.current);
        hintBoostTimerRef.current = null;
      }
    };
  }, []);

  function preferenceHoverHandlers(id) {
    return {
      onMouseEnter: () => setHoveredPreferenceId(id),
      onFocusIn: () => setHoveredPreferenceId(id),
      onMouseLeave: () => setHoveredPreferenceId((current) => (current === id ? null : current)),
      onFocusOut: () => setHoveredPreferenceId((current) => (current === id ? null : current))
    };
  }

  function handleHintBoxClick() {
    setIsHintGearBoosted(false);

    if (hintBoostTimerRef.current) {
      globalThis.clearTimeout(hintBoostTimerRef.current);
      hintBoostTimerRef.current = null;
    }

    globalThis.requestAnimationFrame(() => {
      setIsHintGearBoosted(true);
      hintBoostTimerRef.current = globalThis.setTimeout(() => {
        setIsHintGearBoosted(false);
        hintBoostTimerRef.current = null;
      }, 3000);
    });
  }

  return (
    <PreferencesPanel $isVisible={view === "preferences"}>
      <PreferencesForm>
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

          <div {...preferenceHoverHandlers("showFailoverNotifications")}>
            <PreferenceToggle
              id="showFailoverNotifications"
              checked={Boolean(showFailoverNotifications)}
              onChange={onShowFailoverNotificationsChange}
              label={t("labels.showNotifications")}
              badge={!hasNotificationsPermission ? t("labels.permissionBadge") : undefined}
              badgeTitle={!hasNotificationsPermission ? t("labels.permissionBadgeNotificationsTitle") : undefined}
              badgeTone="permission"
            />
          </div>

          <div {...preferenceHoverHandlers("reloadActiveTabOnToggle")}>
            <PreferenceToggle
              id="reloadActiveTabOnToggle"
              checked={Boolean(reloadActiveTabOnToggle)}
              onChange={onReloadActiveTabChange}
              label={t("labels.autoReloadTab")}
              badge={!hasTabsPermission ? t("labels.permissionBadge") : undefined}
              badgeTitle={!hasTabsPermission ? t("labels.permissionBadgeTabsTitle") : undefined}
              badgeTone="permission"
            />
          </div>

          <div {...preferenceHoverHandlers("autoFailoverEnabled")}>
            <PreferenceToggle
              id="autoFailoverEnabled"
              checked={Boolean(autoFailoverEnabled)}
              onChange={onAutoFailoverChange}
              label={t("labels.autoFailoverSimple")}
              badge={t("labels.betaBadge")}
              badgeTitle={t("labels.betaBadgeFailoverTitle")}
              badgeTone="beta"
            />
          </div>

          <PreferencesHintBox aria-live="polite" onClick={handleHintBoxClick}>
            <PreferencesHintPlaceholder
              aria-hidden="true"
              $isHintActive={Boolean(activeHint)}
              $isBoosted={isHintGearBoosted}
            >
              <PreferencesSvg size={48} />
            </PreferencesHintPlaceholder>
            <PreferencesHintText>{activeHint || " "}</PreferencesHintText>
          </PreferencesHintBox>
        </PreferencesGroup>
      </PreferencesForm>
    </PreferencesPanel>
  );
}
