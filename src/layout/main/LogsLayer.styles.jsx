import styled from "styled-components";

export const StyledLogsLayer = styled.div`
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: auto;
  z-index: 2;
  transition: opacity 140ms ease;
`;