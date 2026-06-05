import styled from "styled-components";

export const StyledFooterProxyStatus = styled.div`
  display: grid;
  min-width: 0;
  max-width: 100%;
  color: #435364;

  > div {
    grid-area: 1 / 1;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
    transition: opacity 160ms ease, transform 160ms ease;
  }

  > div[data-visible="true"] {
    opacity: 1;
    pointer-events: auto;
    transform: translateY(0);
  }

  > div[data-visible="false"] {
    opacity: 0;
    pointer-events: none;
    transform: translateY(-4px);
  }

  > div:last-child {
    cursor: pointer;
  }

  &:hover {
    color: #2f445d;
  }

  > div:last-child:hover {
    color: #2f445d;
  }

  button {
    border: none;
    border-radius: 999px;
    padding: 4px 8px;
    background: #f2f6fb;
    color: #37506b;
    font-size: 0.62rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 120ms ease, color 120ms ease;
  }

  button:hover {
    background: #e4edf8;
    color: #1f3249;
  }
`;