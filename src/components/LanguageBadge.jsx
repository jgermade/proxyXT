import { h } from "preact";
import { LanguageFlag } from "./LanguageFlag.jsx";
import { BadgeFlag, BadgeText, StyledLanguageBadge } from "./LanguageBadge.styles.jsx";

export function LanguageBadge({ preference, effectiveLanguage, t, onClick }) {
  const isAuto = preference === "auto";
  const languageCode = String(effectiveLanguage || "en").toUpperCase();
  const isClickable = typeof onClick === "function";
  const label = isAuto ? t("language.auto") : languageCode;
  const clickableLabel = `${label} · ${t("buttons.preferences.show")}`;

  return (
    <StyledLanguageBadge
      type="button"
      $isClickable={isClickable}
      title={isClickable ? clickableLabel : label}
      aria-label={isClickable ? clickableLabel : label}
      onClick={onClick}
      disabled={!isClickable}
    >
      <BadgeFlag>
        <LanguageFlag language={effectiveLanguage} />
      </BadgeFlag>
      <BadgeText>{label}</BadgeText>
    </StyledLanguageBadge>
  );
}
