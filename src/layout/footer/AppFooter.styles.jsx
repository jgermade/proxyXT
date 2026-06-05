import styled, { css } from "styled-components";

export const StyledAppFooter = styled.footer.attrs({
  "data-component": "AppFooter"
})`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 16px;
  min-height: 48px;
  color: #40546d;
  font-size: 0.81rem;
  background: #ffffff;
  ${({ $isHidden }) =>
    $isHidden &&
    css`
      display: none;
    `}

  > div:first-child {
    flex: 1 1 auto;
    min-width: 0;
  }
`;