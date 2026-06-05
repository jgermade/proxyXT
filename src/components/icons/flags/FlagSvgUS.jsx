import { h } from "preact";

export function FlagSvgUS({ width = 18, height = 12 }) {
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
