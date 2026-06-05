import { h } from "preact";

export function FlagSvgES({ width = 18, height = 12 }) {
  return (
    <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
      <rect width="18" height="12" fill="#c8102e" />
      <rect y="3" width="18" height="6" fill="#ffcf00" />
    </svg>
  );
}
