import styled, { css } from "styled-components";

const sharedButtonStyles = css`
  border: none;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease, opacity 120ms ease;

  &:focus-visible {
    outline: none;
  }
`;

const iconDefaultStyles = css`
  background: transparent;
  color: #4f6785;
  opacity: 0.85;
  position: relative;

  &:hover {
    opacity: 1;
    filter: none;
  }

  ${({ $active }) =>
    $active &&
    css`
      color: var(--brand-orange);
      opacity: 1;
    `}

  ${({ $hasError }) =>
    $hasError &&
    css`
      &::after {
        content: "!";
        position: absolute;
        top: -4px;
        right: -4px;
        background: var(--brand-orange);
        color: #fff;
        border-radius: 50%;
        width: 13px;
        height: 13px;
        font-size: 0.6rem;
        font-weight: 700;
        line-height: 13px;
        text-align: center;
        pointer-events: none;
      }
    `}
`;

const plusToggleStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  background: var(--brand-blue);
  color: #ffffff;
  font-size: 1.08rem;
  line-height: 1;
  border-radius: 11px;

  &:hover {
    background: #0967d4;
    filter: none;
  }
`;

const headerSlotStyles = css`
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: #d8e6ff;
  color: #2f4f7d;
  opacity: 1;

  &:hover {
    background: #cbdfff;
  }

  ${({ $active }) =>
    $active &&
    css`
      background: #ffd9c4;
      color: #8d2f00;

      &:hover {
        background: #ffc9ab;
      }
    `}
`;

const footerSlotStyles = css`
  font-size: 0.9rem;
  padding: 2px 4px;
  border-radius: 8px;

  ${({ $active }) =>
    $active &&
    css`
      background: #ffd9c4;
      color: #8d2f00;
      opacity: 1;

      &:hover {
        background: #ffc9ab;
        color: #7d2a00;
      }
    `}
`;

export const StyledSquaredButton = styled.button`
  ${sharedButtonStyles}

  ${({ $variant }) => ($variant === "plusToggle" ? plusToggleStyles : iconDefaultStyles)}

  ${({ $slot, $variant }) => {
    if ($variant === "plusToggle") {
      return "";
    }

    if ($slot === "header") {
      return headerSlotStyles;
    }

    if ($slot === "footer") {
      return footerSlotStyles;
    }

    return "";
  }}
`;