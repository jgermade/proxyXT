import { h } from "preact";
import { ActiveFooter } from "./ActiveFooter.jsx";
import { StyledFooterProxyStatus } from "./FooterProxyStatus.styles.jsx";
import { FooterProxyValue } from "./FooterProxyValue.jsx";

export function FooterProxyStatus({
  feedbackState,
  activeNotice,
  proxyDisplay,
  isProxyActive = false,
  handleOpenList,
  handleDismissFooterFeedback,
  t,
  ...rest
}) {
  const hasFeedback = Boolean(feedbackState);
  const hasActiveNotice = !hasFeedback && Boolean(activeNotice);
  const showProxy = !hasFeedback && !hasActiveNotice;

  return (
    <StyledFooterProxyStatus {...rest}>
      <div data-visible={hasFeedback ? "true" : "false"} aria-hidden={!hasFeedback}>
        {feedbackState ? (
          <ActiveFooter
            key={feedbackState.id}
            $isFeedback
            $isError={feedbackState.isError}
            $feedbackPhase={feedbackState.phase}
            dismissable
            dismissLabel={t("buttons.dismiss")}
            onDismiss={handleDismissFooterFeedback}
          >
            {feedbackState.message}
          </ActiveFooter>
        ) : null}
      </div>

      <div
        data-visible={hasActiveNotice ? "true" : "false"}
        aria-hidden={!hasActiveNotice}
        role="status"
        aria-live="polite"
      >
        {activeNotice ? (
          <ActiveFooter
            key={activeNotice.key}
            $isFeedback
            $isError
            $feedbackPhase="enter"
            title={activeNotice.message}
            dismissable
            dismissLabel={t("buttons.dismiss")}
            onDismiss={activeNotice.onDismiss}
          >
            {activeNotice.message}
          </ActiveFooter>
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