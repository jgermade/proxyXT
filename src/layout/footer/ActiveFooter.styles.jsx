import styled from "styled-components";

export const StyledActiveFooter = styled.span`
  min-width: 0;
  display: ${({ $isFeedback }) => ($isFeedback ? "block" : "inline-flex")};
  align-items: ${({ $isFeedback }) => ($isFeedback ? "initial" : "center")};
  max-width: 100%;
  white-space: ${({ $isFeedback }) => ($isFeedback ? "normal" : "nowrap")};
  overflow-wrap: ${({ $isFeedback }) => ($isFeedback ? "anywhere" : "normal")};
  overflow: ${({ $isFeedback }) => ($isFeedback ? "visible" : "hidden")};
  text-overflow: ${({ $isFeedback }) => ($isFeedback ? "clip" : "ellipsis")};
  font-size: 0.62rem;
  line-height: ${({ $isFeedback }) => ($isFeedback ? "1.15" : "1")};
  padding: ${({ $isFeedback }) => ($isFeedback ? "4px 6px" : "0")};
  border-radius: ${({ $isFeedback }) => ($isFeedback ? "999px" : "0")};
  border: ${({ $isFeedback }) => ($isFeedback ? "1px solid" : "none")};
  font-family: ${({ $isFeedback }) => ($isFeedback ? '"SF Mono", "Consolas", monospace' : "inherit")};
  color: ${({ $isFeedback, $isError }) => {
    if (!$isFeedback) return "inherit";
    return $isError ? "#8a2f0a" : "#195c2f";
  }};
  background: ${({ $isFeedback, $isError }) => {
    if (!$isFeedback) return "transparent";
    return $isError ? "#fff2e8" : "#e9f9ee";
  }};
  border-color: ${({ $isFeedback, $isError }) => {
    if (!$isFeedback) return "transparent";
    return $isError ? "#f4c6aa" : "#a8e1bc";
  }};
`;