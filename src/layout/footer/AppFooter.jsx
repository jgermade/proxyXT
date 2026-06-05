import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { SquaredButton } from "../../components/SquaredButton.jsx";
import { LanguageBadge } from "../../components/LanguageBadge.jsx";
import { LogsSvg } from "../../components/icons/LogsSvg.jsx";
import { FooterActions } from "./FooterActions.jsx";
import { FooterProxyStatus } from "./FooterProxyStatus.jsx";
import { StyledAppFooter } from "./AppFooter.styles.jsx";

const FEEDBACK_ANIMATION_MS = 220;

export function AppFooter({
  isHidden = false,
  footerFeedbackMessage,
  isFooterFeedbackError,
  footerStatus,
  handleOpenList,
  t,
  activeServerId,
  activeProxyDisplay,
  languagePreference,
  effectiveLanguage,
  handleOpenPreferences,
  view,
  hasErrorLogs,
  handleDismissFooterError,
  onToggleLogs
}) {
  const [feedbackState, setFeedbackState] = useState(null);
  const animationTimerRef = useRef(null);
  const [footerNow, setFooterNow] = useState(() => Date.now());

  useEffect(() => {
    if (animationTimerRef.current) {
      globalThis.clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    if (footerFeedbackMessage) {
      setFeedbackState({
        message: footerFeedbackMessage,
        isError: Boolean(isFooterFeedbackError),
        phase: "enter"
      });
      return undefined;
    }

    setFeedbackState((current) => {
      if (!current) {
        return null;
      }

      const next = { ...current, phase: "exit" };
      animationTimerRef.current = globalThis.setTimeout(() => {
        setFeedbackState(null);
        animationTimerRef.current = null;
      }, FEEDBACK_ANIMATION_MS);
      return next;
    });

    return undefined;
  }, [footerFeedbackMessage, isFooterFeedbackError]);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        globalThis.clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!footerStatus?.connectionFailure) {
      return undefined;
    }

    const timer = globalThis.setInterval(() => {
      setFooterNow(Date.now());
    }, 1000);

    return () => {
      globalThis.clearInterval(timer);
    };
  }, [footerStatus?.connectionFailure?.startedAt, footerStatus?.connectionFailure?.attemptCount]);

  const connectionFailure = footerStatus?.connectionFailure || null;
  const connectionFailureVisible = Boolean(
    connectionFailure && footerNow - Number(connectionFailure.startedAt || 0) >= 60000
  );

  const activeFooterError = footerStatus?.activeError
    ? {
        message: t("messages.footerFailoverError"),
        dismissable: true
      }
    : connectionFailureVisible
      ? {
          message: t("messages.footerConnectionFailure", {
            attempts: String(connectionFailure.attemptCount || 1)
          }),
          dismissable: false
        }
      : null;

  return (
    <StyledAppFooter $isHidden={isHidden}>
      <div>
        <FooterProxyStatus
          id="activeFooter"
          feedbackState={feedbackState}
          activeError={activeFooterError}
          proxyDisplay={activeProxyDisplay}
          isProxyActive={Boolean(activeServerId)}
          handleOpenList={handleOpenList}
          handleDismissFooterError={handleDismissFooterError}
          t={t}
        />
      </div>

      <FooterActions>
        <SquaredButton
          variant="icon"
          slot="footer"
          active={view === "logs"}
          hasError={hasErrorLogs}
          ariaLabel={view === "logs" ? t("buttons.logs.hide") : t("buttons.logs.show")}
          title={t("buttons.logs.title")}
          onClick={onToggleLogs}
        >
          <LogsSvg />
        </SquaredButton>
        
        <LanguageBadge
          preference={languagePreference}
          effectiveLanguage={effectiveLanguage}
          t={t}
          onClick={handleOpenPreferences}
        />
      </FooterActions>
    </StyledAppFooter>
  );
}