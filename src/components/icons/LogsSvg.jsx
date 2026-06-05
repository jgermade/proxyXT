import { h } from "preact";

export function LogsSvg({ size = 18, width = size, height = size, color = "currentColor" }) {
  return (
    <svg
      width={typeof width === 'string' ? width : `${width}px`}
      height={typeof height === 'string' ? height : `${height}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12 8.2c-2.87 0-5.2 2.33-5.2 5.2v2.1c0 2.87 2.33 5.2 5.2 5.2s5.2-2.33 5.2-5.2v-2.1c0-2.87-2.33-5.2-5.2-5.2Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 8.2V5.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9.2 4.6 12 5.5l2.8-.9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.1 11.2 4.5 9.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.9 11.2 19.5 9.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M7.1 14.7 4.5 14.7" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16.9 14.7h2.6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
