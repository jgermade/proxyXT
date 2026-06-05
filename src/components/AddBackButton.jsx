import { h } from "preact";
import { BackSymbolSvg } from "./icons/BackSymbolSvg.jsx";
import { PlusSymbolSvg } from "./icons/PlusSymbolSvg.jsx";

function buildClassName(variant, className, active, hasError) {
  const classes = [variant === "plusToggle" ? "plus-button" : "ghost icon-btn", className];
  if (active) {
    classes.push("is-active");
  }
  if (hasError) {
    classes.push("has-error");
  }
  return classes.filter(Boolean).join(" ");
}

export function AddBackButton({
  view,
  onClick,
  variant = "icon",
  className = "",
  active = false,
  hasError = false,
  title,
  ariaLabel,
  children
}) {
  const content =
    variant === "plusToggle" ? (view === "list" ? <PlusSymbolSvg /> : <BackSymbolSvg />) : children;

  return (
    <button
      type="button"
      className={buildClassName(variant, className, active, hasError)}
      aria-label={ariaLabel || (view === "list" ? "Agregar servidor" : "Volver al listado")}
      title={title}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
