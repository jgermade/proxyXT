import { h } from "preact";

export function FlagSvgPT({ width = 18, height = 12 }) {
  return (
    <svg viewBox="0 0 18 12" width={width} height={height} aria-hidden="true">
      <rect width="7" height="12" fill="#006847" />
      <rect x="7" width="11" height="12" fill="#da291c" />
      <circle cx="8" cy="6" r="2.2" fill="#ffcd00" />
    </svg>
  );
}
