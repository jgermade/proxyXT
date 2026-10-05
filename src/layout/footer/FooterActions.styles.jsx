import styled from "styled-components";

export const StyledFooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 0 0 auto;
  overflow: visible;
`;

export const StyledFooterIconLink = styled.a`
  display: inline-grid;
  place-items: center;
  padding: 2px 4px;
  border-radius: 8px;
  color: #4f6785;
  background: #ffffff;
  opacity: 0.85;
  text-decoration: none;
  transition: background 120ms ease, color 120ms ease, opacity 120ms ease;

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: none;
    opacity: 1;
    box-shadow: 0 0 0 2px rgba(47, 79, 125, 0.15);
  }
`;
