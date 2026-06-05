import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { SquaredButton } from "../../components/SquaredButton.jsx";
import { LanguageBadge } from "../../components/LanguageBadge.jsx";
import { LogsSvg } from "../../components/icons/LogsSvg.jsx";
import { ActiveFooter } from "./ActiveFooter.jsx";
import { FooterActions } from "./FooterActions.jsx";
import { FooterProxyLabel } from "./FooterProxyLabel.jsx";
import { FooterProxyStatus } from "./FooterProxyStatus.jsx";
import { FooterProxyValue } from "./FooterProxyValue.jsx";
import { StyledAppFooter } from "./AppFooter.styles.jsx";

const FEEDBACK_ANIMATION_MS = 220;

export function AppFooter({
  isHidden = false,
  footerFeedbackMessage,
  isFooterFeedbackError,
  handleOpenList,
  t,
  activeServerId,
  activeProxyDisplay,
  languagePreference,
  effectiveLanguage,
  handleOpenPreferences,
  view,
  hasErrorLogs,
  onToggleLogs
}) {
  const [feedbackState, setFeedbackState] = useState(null);
  const animationTimerRef = useRef(null);

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

  return (
    <StyledAppFooter $isHidden={isHidden}>
      <div>
        {feedbackState ? (
          <ActiveFooter
            id="activeFooter"
            $isFeedback
            $isError={feedbackState.isError}
            $feedbackPhase={feedbackState.phase}
          >
            {feedbackState.message}
          </ActiveFooter>
        ) : (
          <FooterProxyStatus id="activeFooter" onClick={handleOpenList}>
            <FooterProxyValue isActive={Boolean(activeServerId)}> {activeProxyDisplay}</FooterProxyValue>
          </FooterProxyStatus>
        )}
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