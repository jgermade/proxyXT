import styled, { keyframes } from "styled-components";

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

  svg {
    width: 14px;
    height: 14px;
  }
`;

export const LogsContent = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LogEntryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
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
  background: #f4f8ff;
  border-radius: 0 4px 4px 0;
  font-size: 0.68rem;
  line-height: 1.45;
  color: #2d425a;
  font-family: "SF Mono", "Consolas", monospace;
  white-space: pre;
  overflow-x: auto;
`;