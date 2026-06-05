import { h } from "preact";

export function PlusSymbolSvg({ size = 16, width = size, height = size, color = "currentColor" }) {
  return (
    <svg
      width={typeof width === 'string' ? width : `${width}px`}
      height={typeof height === 'string' ? height : `${height}px`}
      viewBox="0 0 448 512"
      fill={color}
    >
      <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"></path>
    </svg>
  );
}
