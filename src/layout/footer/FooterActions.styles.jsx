import styled, { keyframes } from "styled-components";

const connectionNoticeEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(-50%) scaleX(0.45) translateX(8px);
  }

  to {
    opacity: 1;
    transform: translateY(-50%) scaleX(1) translateX(0);
  }
`;

const connectionNoticeExit = keyframes`
  from {
    opacity: 1;
    transform: translateY(-50%) scaleX(1) translateX(0);
  }

  to {
    opacity: 0;
    transform: translateY(-50%) scaleX(0.45) translateX(8px);
  }
`;

export const StyledFooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  overflow: visible;
`;

export const StyledLogsBadgeAnchor = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const StyledFooterIconLink = styled.a`
  display: inline-grid;
  place-items: center;
  padding: 2px 4px;
  border-radius: 8px;
  color: #4f6785;
  opacity: 0.85;
  text-decoration: none;
  transition: background 120ms ease, color 120ms ease, opacity 120ms ease;

  &:hover {
    opacity: 1;
    background: rgba(216, 230, 255, 0.45);
  }

  &:focus-visible {
    outline: none;
    opacity: 1;
    background: rgba(216, 230, 255, 0.55);
    box-shadow: 0 0 0 2px rgba(47, 79, 125, 0.15);
  }
`;

export const StyledFooterConnectionBadge = styled.button`
  position: absolute;
  right: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  border: none;
  background: #fff2e8;
  color: #8a2f0a;
  height: 20px;
  min-width: 20px;
  padding: 0 6px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.62rem;
  line-height: 1;
  font-family: "SF Mono", "Consolas", monospace;
  font-weight: 700;
  cursor: pointer;
  opacity: ${({ $isHidden }) => ($isHidden ? 0 : 1)};
  pointer-events: ${({ $isHidden }) => ($isHidden ? "none" : "auto")};
  transition: color 120ms ease, background 120ms ease, opacity 120ms ease;

  > span:first-child {
    font-size: 0.68rem;
    transform: translateY(-0.5px);
  }

  &:hover {
    background: #ffe7d6;
    color: #6f2407;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(138, 47, 10, 0.2);
  }
`;

export const StyledFooterConnectionNotice = styled.div`
  position: absolute;
  right: calc(100% + 6px);
  top: 50%;
  transform: translateY(-50%);
  transform-origin: right center;
  z-index: 1;
  width: min(260px, 60vw);
  height: 24px;
  padding: 0 4px 0 8px;
  border-radius: 999px;
  border: 1px solid #f4c6aa;
  background: #fff2e8;
  color: #8a2f0a;
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  animation: ${({ $isClosing }) =>
    $isClosing
      ? connectionNoticeExit
      : connectionNoticeEnter} 200ms cubic-bezier(0.22, 1, 0.36, 1) both;

  > span {
    min-width: 0;
    font-size: 0.62rem;
    line-height: 1;
    font-family: "SF Mono", "Consolas", monospace;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  > button {
    border: none;
    width: 18px;
    height: 18px;
    padding: 0;
    border-radius: 999px;
    background: transparent;
    color: #8a2f0a;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: color 120ms ease;
    flex: 0 0 auto;
    margin-left: auto;
  }

  > button:hover {
    color: #6f2407;
  }

  > button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(138, 47, 10, 0.2);
  }
`;