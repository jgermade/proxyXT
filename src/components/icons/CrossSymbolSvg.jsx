import { h } from "preact"

export function CrossSymbolSvg({ size = 24, width = size, height = size, color = "currentColor" }) {
    return (
        <svg
            width={typeof width === 'string' ? width : `${width}px`}
            height={typeof height === 'string' ? height : `${height}px`}
            fill={color}
            viewBox="0 0 24 24"
        >
            <path d="M5 5L19 19M5 19L19 5" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    )
}