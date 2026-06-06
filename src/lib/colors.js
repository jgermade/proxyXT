export function getContrastingTextColor(hexColor) {
  const value = String(hexColor || "").trim().replace("#", "");
  const expanded = value.length === 3
    ? value.split("").map((part) => `${part}${part}`).join("")
    : value;

  if (!/^[0-9A-Fa-f]{6}$/.test(expanded)) {
    return "#1a2530";
  }

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? "#1a2530" : "#ffffff";
}