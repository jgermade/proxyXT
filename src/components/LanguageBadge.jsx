import { h } from "preact";
import { LanguageFlag } from "./LanguageFlag.jsx";

export function LanguageBadge({ preference, effectiveLanguage, t, onClick }) {
  const isAuto = preference === "auto";
  const languageCode = String(effectiveLanguage || "en").toUpperCase();
  const isClickable = typeof onClick === "function";
  const label = isAuto ? `${t("language.auto")} ${languageCode}` : languageCode;
  const clickableLabel = `${label} · ${t("buttons.preferences.show")}`;

  return (
    <button
      type="button"
      className={`language-badge${isClickable ? " is-clickable" : ""}`}
      title={isClickable ? clickableLabel : label}
      aria-label={isClickable ? clickableLabel : label}
      onClick={onClick}
      disabled={!isClickable}
    >
      <span className="language-badge-flag">
        <LanguageFlag language={effectiveLanguage} />
      </span>
      <span className="language-badge-text">{isAuto ? `${t("language.auto")} ${languageCode}` : languageCode}</span>
    </button>
  );
}
