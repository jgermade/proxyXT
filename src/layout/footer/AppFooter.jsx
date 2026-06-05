import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { SquaredButton } from "../../components/SquaredButton.jsx";
import { LanguageBadge } from "../../components/LanguageBadge.jsx";
import { CrossSymbolSvg } from "../../components/icons/CrossSymbolSvg.jsx";
import { LogsSvg } from "../../components/icons/LogsSvg.jsx";
import { FooterActions } from "./FooterActions.jsx";
import {
  StyledFooterConnectionBadge,
  StyledFooterConnectionNotice,
  StyledLogsBadgeAnchor
} from "./FooterActions.styles.jsx";
import { FooterProxyStatus } from "./FooterProxyStatus.jsx";
import { StyledAppFooter } from "./AppFooter.styles.jsx";

const FEEDBACK_ANIMATION_MS = 220;
const CONNECTION_NOTICE_ANIMATION_MS = 200;

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
  handleDismissFooterFeedback,
  onToggleLogs
}) {
  const [feedbackState, setFeedbackState] = useState(null);
  const animationTimerRef = useRef(null);
  const connectionNoticeTimerRef = useRef(null);
  const [footerNow, setFooterNow] = useState(() => Date.now());
  const [connectionNoticeState, setConnectionNoticeState] = useState("badge");

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
      if (connectionNoticeTimerRef.current) {
        globalThis.clearTimeout(connectionNoticeTimerRef.current);
        connectionNoticeTimerRef.current = null;
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
  const connectionFailureAttempts = Number(connectionFailure?.attemptCount || 1);
  const connectionFailureMessageKey =
    connectionFailureAttempts === 1
      ? "messages.footerConnectionFailureOne"
      : "messages.footerConnectionFailureMany";
  const connectionFailureMessage = t(connectionFailureMessageKey, {
    attempts: String(connectionFailureAttempts)
  });

  const activeFooterError = footerStatus?.activeError
    ? {
        message: t("messages.footerFailoverError"),
        dismissable: true
      }
    : null;

  useEffect(() => {
    if (!connectionFailureVisible) {
      if (connectionNoticeTimerRef.current) {
        globalThis.clearTimeout(connectionNoticeTimerRef.current);
        connectionNoticeTimerRef.current = null;
      }
      setConnectionNoticeState("badge");
    }
  }, [connectionFailureVisible]);

  function handleExpandConnectionNotice() {
    if (connectionNoticeTimerRef.current) {
      globalThis.clearTimeout(connectionNoticeTimerRef.current);
      connectionNoticeTimerRef.current = null;
    }
    setConnectionNoticeState("notice");
  }

  function handleDismissConnectionNotice() {
    if (connectionNoticeTimerRef.current) {
      globalThis.clearTimeout(connectionNoticeTimerRef.current);
      connectionNoticeTimerRef.current = null;
    }

    setConnectionNoticeState("closing");
    connectionNoticeTimerRef.current = globalThis.setTimeout(() => {
      setConnectionNoticeState("badge");
      connectionNoticeTimerRef.current = null;
    }, CONNECTION_NOTICE_ANIMATION_MS);
  }

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
          handleDismissFooterFeedback={handleDismissFooterFeedback}
          t={t}
        />
      </div>

      <FooterActions>
        <StyledLogsBadgeAnchor>
          {connectionFailureVisible ? (
            <>
              <StyledFooterConnectionBadge
                type="button"
                title={connectionFailureMessage}
                aria-label={connectionFailureMessage}
                $isHidden={connectionNoticeState !== "badge"}
                onClick={handleExpandConnectionNotice}
              >
                <span aria-hidden="true">!</span>
                <span>{connectionFailureAttempts}</span>
              </StyledFooterConnectionBadge>

              {connectionNoticeState !== "badge" ? (
                <StyledFooterConnectionNotice
                  role="status"
                  aria-live="polite"
                  $isClosing={connectionNoticeState === "closing"}
                >
                  <span>{connectionFailureMessage}</span>
                  <button
                    type="button"
                    aria-label={t("buttons.dismiss")}
                    title={t("buttons.dismiss")}
                    onClick={() => {
                      handleDismissConnectionNotice();
                    }}
                  >
                    <CrossSymbolSvg width={11} height={11} color="currentColor" />
                  </button>
                </StyledFooterConnectionNotice>
              ) : null}
            </>
          ) : null}

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
        </StyledLogsBadgeAnchor>
        
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