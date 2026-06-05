import styled, { css, keyframes } from "styled-components";

const userColorShake = keyframes`
  0% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-0.6px) rotate(-1deg); }
  50% { transform: translateX(0.6px) rotate(1deg); }
  75% { transform: translateX(-0.4px) rotate(-0.6deg); }
  100% { transform: translateX(0) rotate(0deg); }
`;

const buttonBaseStyles = css`
  border: none;
  border-radius: 9px;
  padding: 7px 10px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease;

  &:focus-visible {
    outline: none;
  }
`;

export const FormPanel = styled.section`
  min-height: 192px;
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
`;

export const ProxyForm = styled.form`
  display: grid;
  gap: 8px;
  background: #f4f8ff;
  padding: 16px;
`;

export const FormRow = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 1fr 1fr;
`;

export const HostColorRow = styled.div`
  display: grid;
  gap: 8px;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: end;
`;

export const ColorPresetPanel = styled.div`
  display: grid;
  grid-template-rows: repeat(2, minmax(0, 1fr));
  gap: 4px;
  height: 48px;
  box-sizing: border-box;
  padding: 4px;
  background: #e6edf7;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px #8ba4c6;
`;

export const ColorPresetRow = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 18px;
  gap: 4px;
  align-items: center;
  overflow: hidden;
`;

export const UserColorRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 4px;
  align-items: center;
`;

export const UserColorActions = styled.div`
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 18px;
  gap: 4px;
  align-items: center;
`;

export const UserColorList = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 18px;
  gap: 4px;
  align-items: center;
  overflow: hidden;
`;

export const ColorPresetButton = styled.button`
  width: 18px;
  height: 18px;
  box-sizing: border-box;
  border: none;
  border-radius: 4px;
  padding: 0;
  background: transparent;
  box-shadow: none;
  cursor: pointer;
  appearance: none;
  transition: transform 120ms ease, filter 120ms ease, opacity 120ms ease;

  &:hover {
    filter: brightness(1.04);
    transform: translateY(-1px);
  }

  &:active {
    filter: brightness(0.88);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(0, 83, 255, 0.15);
  }
`;

export const UserColorButton = styled(ColorPresetButton)`
  background: #d9e5f6;
  box-shadow: inset 0 0 0 1px #b6c8e2;
  position: relative;
  overflow: hidden;

  ${({ $deleteMode, $isDeleteToggle }) =>
    $deleteMode &&
    !$isDeleteToggle &&
    css`
      animation: ${userColorShake} 360ms ease-in-out infinite;
    `}

  ${({ $isDeleteToggle, $deleteMode }) =>
    $isDeleteToggle &&
    css`
      background: ${$deleteMode ? "#ffd9c4" : "transparent"};
      box-shadow: none;

      &:hover {
        background: ${$deleteMode ? "#ffc9ab" : "transparent"};
      }

      &:active {
        background: ${$deleteMode ? "#ffb892" : "transparent"};
      }
    `}

  &:hover {
    background: #d2def2;
    filter: none;
    transform: translateY(-1px);
    animation: none;
  }

  &:active {
    background: #becee8;
  }
`;

export const ColorPresetSwatch = styled.span`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: ${({ $value }) => $value || "transparent"};
`;

export const UserColorPickerIcon = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #395170;
  opacity: 0;
  transition: opacity 120ms ease;

  ${UserColorButton}:hover & {
    opacity: 1;
  }
`;

export const UserColorBanIcon = styled(UserColorPickerIcon)`
  color: #8a2f0a;
`;

export const UserColorDeleteToggleIcon = styled(UserColorPickerIcon)`
  color: #8a2f0a;
  opacity: 0.92;

  ${UserColorButton}:hover & {
    opacity: 1;
  }
`;

export const UserColorAddIcon = styled(UserColorPickerIcon)`
  opacity: 0.92;

  ${UserColorButton}:hover & {
    opacity: 1;
  }
`;

export const HiddenColorInput = styled.input`
  display: none;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
`;

export const SubmitButton = styled.button`
  ${buttonBaseStyles}
  background: var(--brand-blue);
  color: #fff;

  &:hover {
    background: #0967d4;
    filter: none;
  }
`;

export const DeleteButton = styled.button`
  ${buttonBaseStyles}
  margin-left: auto;
  background: #ffffff;
  color: #334a66;
  display: ${({ $isVisible }) => ($isVisible ? "inline-block" : "none")};

  &:hover {
    background: #e63946;
    color: #ffffff;
  }
`;