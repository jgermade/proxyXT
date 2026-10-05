import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { SquaredButton } from "../../components/SquaredButton.jsx";
import { LanguageBadge } from "../../components/LanguageBadge.jsx";
import { GithubLogoSvg } from "../../components/icons/GithubLogoSvg.jsx";
import { LogsSvg } from "../../components/icons/LogsSvg.jsx";
import { FooterActions } from "./FooterActions.jsx";
import { StyledFooterIconLink } from "./FooterActions.styles.jsx";
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
  handleDismissFooterFeedback,
  onToggleLogs
}) {
  const [feedbackState, setFeedbackState] = useState(null);
  const animationTimerRef = useRef(null);
  const feedbackSequenceRef = useRef(0);
  const [footerNow, setFooterNow] = useState(() => Date.now());

  useEffect(() => {
    if (animationTimerRef.current) {
      globalThis.clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    if (footerFeedbackMessage) {
      feedbackSequenceRef.current += 1;
      setFeedbackState({
        id: feedbackSequenceRef.current,
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
  const connectionFailureAttempts = Number(connectionFailure?.attemptCount || 1);
  const connectionFailureMessageKey =
    connectionFailureAttempts === 1
      ? "messages.footerConnectionFailureOne"
      : "messages.footerConnectionFailureMany";
  const connectionFailureMessage = t(connectionFailureMessageKey, {
    attempts: String(connectionFailureAttempts)
  });

  // Un único aviso a la vez en la zona de estado: el fallo de proxy tiene prioridad
  // sobre la conexión inestable, y cada uno se descarta por separado.
  const activeError = footerStatus?.activeError || null;
  const activeNotice = activeError
    ? {
        key: `activeError:${activeError.id || activeError.createdAt || ""}`,
        message: t("messages.footerFailoverError"),
        onDismiss: () => handleDismissFooterError?.("activeError")
      }
    : connectionFailureVisible
      ? {
          key: `connectionFailure:${connectionFailure.startedAt || ""}`,
          message: connectionFailureMessage,
          onDismiss: () => handleDismissFooterError?.("connectionFailure")
        }
      : null;

  return (
    <StyledAppFooter $isHidden={isHidden}>
      <div>
        <FooterProxyStatus
          id="activeFooter"
          feedbackState={feedbackState}
          activeNotice={activeNotice}
          proxyDisplay={activeProxyDisplay}
          isProxyActive={Boolean(activeServerId)}
          handleOpenList={handleOpenList}
          handleDismissFooterFeedback={handleDismissFooterFeedback}
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

        <StyledFooterIconLink
          href="https://github.com/jgermade/proxyXT"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
          title="GitHub"
        >
          <GithubLogoSvg size={17} />
        </StyledFooterIconLink>
        
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