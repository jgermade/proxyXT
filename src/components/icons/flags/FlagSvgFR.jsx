import { h } from "preact";

export function FlagSvgFR({ width = 18, height = 12 }) {
  return (
    <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
      <rect width="6" height="12" fill="#0055a4" />
      <rect x="6" width="6" height="12" fill="#ffffff" />
      <rect x="12" width="6" height="12" fill="#ef4135" />
    </svg>
  );
}
