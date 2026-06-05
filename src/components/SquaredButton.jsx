import { h } from "preact";
import { BackSymbolSvg } from "./icons/BackSymbolSvg.jsx";
import { PlusSymbolSvg } from "./icons/PlusSymbolSvg.jsx";
import { StyledSquaredButton } from "./SquaredButton.styles.jsx";

export function SquaredButton({
  view,
  onClick,
  variant = "icon",
  slot = "default",
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
    <StyledSquaredButton
      type="button"
      className={className}
      $variant={variant}
      $slot={slot}
      $active={active}
      $hasError={hasError}
      aria-label={ariaLabel || (view === "list" ? "Agregar servidor" : "Volver al listado")}
      title={title}
      onClick={onClick}
    >
      {content}
    </StyledSquaredButton>
  );
}
