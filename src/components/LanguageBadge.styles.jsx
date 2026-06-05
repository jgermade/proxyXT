import styled, { css } from "styled-components";

export const StyledLanguageBadge = styled.button`
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 6px 2px 3px;
  border-radius: 999px;
  color: #3a4f69;
  font-size: 0.67rem;
  font-weight: 700;
  letter-spacing: 0.02em;

  ${({ $isClickable }) =>
    $isClickable &&
    css`
      cursor: pointer;

      &:hover {
        background: #dbe6f6;
      }
    `}

  &:disabled {
    opacity: 1;
  }
`;

export const BadgeFlag = styled.span`
  display: inline-flex;
  border-radius: 2px;
  overflow: hidden;

  svg {
    display: block;
  }
`;

export const BadgeText = styled.span`
  line-height: 1;
`;