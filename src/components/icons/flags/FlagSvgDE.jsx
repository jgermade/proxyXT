import { h } from "preact";

export function FlagSvgDE({ width = 18, height = 12 }) {
  return (
    <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
      <rect width="18" height="4" fill="#000000" />
      <rect y="4" width="18" height="4" fill="#dd0000" />
      <rect y="8" width="18" height="4" fill="#ffce00" />
    </svg>
  );
}
