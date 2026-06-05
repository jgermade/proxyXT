import { css } from "goober";

export function getActiveFooterClassName({ isFeedback = false, isError = false, feedbackPhase } = {}) {
  const animationRule =
    isFeedback && feedbackPhase === "enter"
      ? "animation: activeFooterFadeInDown 250ms ease-out both;"
      : isFeedback && feedbackPhase === "exit"
        ? "animation: activeFooterFadeOutDown 220ms ease both;"
        : "";

  return css`
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
    font-size: 0.62rem;
    line-height: ${isFeedback ? "1.15" : "1"};
    padding: ${isFeedback ? "4px 6px" : "0"};
    border-radius: ${isFeedback ? "999px" : "0"};
    border: ${isFeedback ? "1px solid" : "none"};
    font-family: ${isFeedback ? '"SF Mono", "Consolas", monospace' : "inherit"};
    color: ${!isFeedback ? "inherit" : isError ? "#8a2f0a" : "#195c2f"};
    background: ${!isFeedback ? "transparent" : isError ? "#fff2e8" : "#e9f9ee"};
    border-color: ${!isFeedback ? "transparent" : isError ? "#f4c6aa" : "#a8e1bc"};
    ${animationRule}

    > [data-role="message"] {
      min-width: 0;
      white-space: nowrap;
      overflow-wrap: normal;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    > button[data-kind="dismiss"] {
      margin-left: 2px;
      width: 20px;
      height: 20px;
      padding: 0;
      border: none;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      color: #37506b;
      cursor: pointer;
      transition: color 120ms ease;
      flex: 0 0 auto;
    }

    > button[data-kind="dismiss"]:hover {
      background: transparent;
      color: #1f3249;
    }

    @keyframes activeFooterFadeInDown {
      from {
        opacity: 0;
        transform: translateY(-12px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes activeFooterFadeOutDown {
      from {
        opacity: 1;
        transform: translateY(0);
      }

      to {
        opacity: 0;
        transform: translateY(6px);
      }
    }
  `;
}