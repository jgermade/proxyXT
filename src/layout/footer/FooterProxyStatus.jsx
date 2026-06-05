import { h } from "preact";
import { ActiveFooter } from "./ActiveFooter.jsx";
import { StyledFooterProxyStatus } from "./FooterProxyStatus.styles.jsx";
import { FooterProxyValue } from "./FooterProxyValue.jsx";

export function FooterProxyStatus({
  feedbackState,
  activeError,
  proxyDisplay,
  isProxyActive = false,
  handleOpenList,
  handleDismissFooterError,
  t,
  ...rest
}) {
  const hasFeedback = Boolean(feedbackState);
  const hasActiveError = Boolean(activeError);
  const showProxy = !hasFeedback && !hasActiveError;

  return (
    <StyledFooterProxyStatus {...rest}>
      <div data-visible={hasFeedback ? "true" : "false"} aria-hidden={!hasFeedback}>
        {feedbackState ? (
          <ActiveFooter $isFeedback $isError={feedbackState.isError} $feedbackPhase={feedbackState.phase}>
            {feedbackState.message}
          </ActiveFooter>
        ) : null}
      </div>

      <div data-visible={hasActiveError ? "true" : "false"} aria-hidden={!hasActiveError}>
        {activeError ? (
          <ActiveFooter $isFeedback $isError $feedbackPhase="enter">
            {activeError.message}
          </ActiveFooter>
        ) : null}
        {activeError?.dismissable ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleDismissFooterError?.();
            }}
          >
            {t("buttons.dismiss")}
          </button>
        ) : null}
      </div>

      <div
        data-visible={showProxy ? "true" : "false"}
        aria-hidden={!showProxy}
        onClick={showProxy ? handleOpenList : undefined}
        role={showProxy ? "button" : undefined}
        tabIndex={showProxy ? 0 : -1}
        onKeyDown={
          showProxy
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenList?.();
                }
              }
            : undefined
        }
      >
        <FooterProxyValue isActive={isProxyActive}>{proxyDisplay}</FooterProxyValue>
      </div>
    </StyledFooterProxyStatus>
  );
}