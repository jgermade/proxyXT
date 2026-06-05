import styled, { css, keyframes } from "styled-components";

const logsReveal = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const overlayFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const overlayFadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const placeholderShake = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
  100% { transform: translateX(0); }
`;

const sadFaceDrop = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(12px);
    opacity: 0.92;
  }
`;

const sadFaceDriftDown = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(12px);
  }
`;

const sadFaceFadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0.82;
  }
`;

export const LogsPanel = styled.section`
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #ffffff;
  overflow: hidden;
  animation: ${logsReveal} 220ms ease-out;
`;

export const LogsToolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;
  background: #e5f0ff;
`;

export const ToolbarTitle = styled.strong`
  font-size: 0.83rem;
  color: #30445f;
`;

export const ToolbarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const FilterMenu = styled.details`
  position: relative;

  &[open] > summary {
    background: #d4e5ff;
    color: #203c5c;
  }
`;

export const FilterToggleButton = styled.summary`
  list-style: none;
  border: none;
  background: transparent;
  color: #355170;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 7px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &::-webkit-details-marker {
    display: none;
  }

  &:hover {
    background: #d4e5ff;
    color: #203c5c;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 83, 255, 0.2);
  }
`;

export const FilterMenuPanel = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 3;
  width: 138px;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #bfd7ff;
  background: #f4f8ff;
  box-shadow: 0 12px 24px rgba(25, 56, 95, 0.18);
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.68rem;
  color: #30445f;
  font-family: "SF Mono", "Consolas", monospace;

  &:hover {
    color: #203c5c;
  }
`;

export const FilterTextButton = styled.button`
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
  color: inherit;
  font: inherit;
  letter-spacing: 0.01em;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }

  &:focus-visible {
    outline: none;
    text-decoration: underline;
  }
`;

export const FilterCheckbox = styled.input`
  margin: 0;
  width: 14px;
  height: 14px;
  accent-color: #2b5ea5;
`;

export const OpenWindowButton = styled.button`
  border: none;
  background: transparent;
  color: #355170;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: #d4e5ff;
    color: #203c5c;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 83, 255, 0.2);
  }
`;

export const CopyLogsButton = styled(OpenWindowButton)``;

export const ClearLogsButton = styled(OpenWindowButton)``;

export const CloseWindowButton = styled(OpenWindowButton)``;

export const LogsContent = styled.div`
  flex: 1;
  min-height: 120px;
  max-height: 100%;
  resize: vertical;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const EmptyLogsState = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  place-items: center;
  color: #8fa1b7;
`;

export const EmptyLogsIllustration = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 999px;
  border: 1px solid #d9e3ef;
  background: #f7fbff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.92;
  animation: ${({ $shouldShake }) =>
    $shouldShake
      ? css`
          ${placeholderShake} 280ms ease-in-out
        `
      : "none"};
`;

export const EmptyLogsSadFaceMotion = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  animation:
    ${sadFaceDriftDown} 4s ease-out forwards,
    ${sadFaceFadeOut} 4s ease-out forwards;
`;

export const EmptyLogsSadFace = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
`;

export const EmptyLogsSadEye = styled.span`
  position: absolute;
  top: 18px;
  width: 14px;
  height: 4px;
  border-radius: 999px;
  background: currentColor;
  animation: ${sadFaceDrop} 3s ease-out forwards;
`;

export const EmptyLogsSadEyeLeft = styled(EmptyLogsSadEye)`
  left: 12px;
`;

export const EmptyLogsSadEyeRight = styled(EmptyLogsSadEye)`
  right: 12px;
`;

export const EmptyLogsSadMouth = styled.span`
  position: absolute;
  left: 50%;
  top: 30px;
  width: 22px;
  height: 12px;
  border-bottom: 3px solid currentColor;
  border-radius: 0 0 22px 22px;
  background: transparent;
  transform: translateX(-50%);
  animation: ${sadFaceDrop} 3s ease-out forwards;
`;

export const ConfirmOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(18, 28, 42, 0.82);
  backdrop-filter: blur(6px);
  animation: ${({ $isClosing }) => ($isClosing ? overlayFadeOut : overlayFadeIn)} 160ms ease forwards;
`;

export const ConfirmCard = styled.div`
  width: min(180px, 100%);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

export const ConfirmText = styled.p`
  margin: 0;
  text-align: center;
  color: #ffffff;
  font-size: 0.76rem;
  line-height: 1.4;
`;

export const ConfirmDangerButton = styled.button`
  border: none;
  border-radius: 8px;
  background: #cc2f2f;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.72rem;
  padding: 7px 14px;
  cursor: pointer;
  transition: background 120ms ease;

  &:hover {
    background: #b62828;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.28);
  }
`;

export const ConfirmDismissButton = styled.button`
  border: none;
  background: transparent;
  color: #d9e6f7;
  font-size: 0.68rem;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

export const LogEntryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: ${({ $level }) => {
    switch ($level) {
      case "success":
        return "#e8f8ef";
      case "warning":
        return "#fff3e0";
      case "error":
        return "#fdecea";
      case "debug":
        return "#f3e8ff";
      case "info":
      default:
        return "#e8f1ff";
    }
  }};
  border-color: ${({ $level }) => {
    switch ($level) {
      case "success":
        return "#b6e2c6";
      case "warning":
        return "#ffd39a";
      case "error":
        return "#f6b6b1";
      case "debug":
        return "#d6b7ff";
      case "info":
      default:
        return "#bfd7ff";
    }
  }};
`;

export const LogTime = styled.span`
  font-size: 0.62rem;
  color: #657d98;
  font-family: "SF Mono", "Consolas", monospace;
`;

export const LogMain = styled.span`
  font-size: 0.72rem;
  line-height: 1.4;
  color: #1f3249;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SF Mono", "Consolas", monospace;
`;

export const LogContext = styled.pre`
  margin: 2px 0 0;
  padding: 4px 6px;
  background: rgba(255, 255, 255, 0.52);
  border-radius: 0 4px 4px 0;
  font-size: 0.68rem;
  line-height: 1.45;
  color: #2d425a;
  font-family: "SF Mono", "Consolas", monospace;
  white-space: pre;
  overflow-x: auto;
`;