import { h } from "preact";
import { CrossSymbolSvg } from "../../components/icons/CrossSymbolSvg.jsx";
import { getActiveFooterClassName } from "./ActiveFooter.styles.jsx";

export function ActiveFooter({
  children,
  className,
  $isFeedback,
  $isError,
  $feedbackPhase,
  dismissable = false,
  dismissLabel,
  onDismiss,
  ...rest
}) {
  const activeFooterClassName = getActiveFooterClassName({
    isFeedback: Boolean($isFeedback),
    isError: Boolean($isError),
    feedbackPhase: $feedbackPhase
  });
  const nextClassName = className ? `${className} ${activeFooterClassName}` : activeFooterClassName;

  return (
    <span data-component="ActiveFooter" className={nextClassName} {...rest}>
      <span data-role="message">{children}</span>
      {dismissable ? (
        <button
          type="button"
          data-kind="dismiss"
          aria-label={dismissLabel}
          title={dismissLabel}
          onClick={(event) => {
            event.stopPropagation();
            onDismiss?.();
          }}
        >
          <CrossSymbolSvg width={12} height={12} color="currentColor" />
        </button>
      ) : null}
    </span>
  );
}