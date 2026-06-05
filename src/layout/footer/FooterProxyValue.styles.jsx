import styled, { keyframes } from "styled-components";

const footerProxyValueOut = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }

  to {
    opacity: 0;
    transform: translateY(16px);
  }
`;

const footerProxyValueIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-16px);
  }

  62% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 1;
    transform: translateY(2px);
  }
`;

export const StyledFooterProxyValue = styled.span.attrs({
  "data-component": "FooterProxyValue"
})`
  display: inline-grid;
  align-items: center;
  color: ${({ $isActive }) => ($isActive ? "var(--brand-blue)" : "#435364")};

  > span {
    grid-area: 1 / 1;
    white-space: nowrap;
    will-change: opacity, transform;
  }

  > [data-role="incoming"] {
    position: ${({ $isAnimating }) => ($isAnimating ? "relative" : "static")};
  }

  > [data-role="incoming"][data-animate="true"] {
    animation: ${footerProxyValueIn} 300ms ease-in both;
  }

  > [data-role="outgoing"] {
    position: relative;
    pointer-events: none;
    animation: ${footerProxyValueOut} 220ms ease both;
  }
`;