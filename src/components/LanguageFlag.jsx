import { h } from "preact";

export function LanguageFlag({ language, width = 18, height = 12 }) {
  if (language === "es") {
    return (
      <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
        <rect width="18" height="12" fill="#c8102e" />
        <rect y="3" width="18" height="6" fill="#ffcf00" />
      </svg>
    );
  }

  if (language === "fr") {
    return (
      <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
        <rect width="6" height="12" fill="#0055a4" />
        <rect x="6" width="6" height="12" fill="#ffffff" />
        <rect x="12" width="6" height="12" fill="#ef4135" />
      </svg>
    );
  }

  if (language === "pt") {
    return (
      <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
        <rect width="7" height="12" fill="#006847" />
        <rect x="7" width="11" height="12" fill="#da291c" />
        <circle cx="8" cy="6" r="2.2" fill="#ffcd00" />
      </svg>
    );
  }

  if (language === "it") {
    return (
      <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
        <rect width="6" height="12" fill="#009246" />
        <rect x="6" width="6" height="12" fill="#ffffff" />
        <rect x="12" width="6" height="12" fill="#ce2b37" />
      </svg>
    );
  }

  if (language === "de") {
    return (
      <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
        <rect width="18" height="4" fill="#000000" />
        <rect y="4" width="18" height="4" fill="#dd0000" />
        <rect y="8" width="18" height="4" fill="#ffce00" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
      <rect width="18" height="12" fill="#b22234" />
      <rect y="1" width="18" height="1" fill="#ffffff" />
      <rect y="3" width="18" height="1" fill="#ffffff" />
      <rect y="5" width="18" height="1" fill="#ffffff" />
      <rect y="7" width="18" height="1" fill="#ffffff" />
      <rect y="9" width="18" height="1" fill="#ffffff" />
      <rect y="11" width="18" height="1" fill="#ffffff" />
      <rect width="8" height="6.5" fill="#3c3b6e" />
      <path d="M0 3.25h8M4 0v6.5" stroke="#ffffff" strokeWidth="0.5" />
    </svg>
  );
}
