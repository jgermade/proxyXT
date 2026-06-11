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
  min-height: 208px;
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
  grid-template-columns: 48px minmax(0, 1fr) minmax(0, 1fr);
  align-items: end;
`;

export const NativeColorPickerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: transparent;
`;

export const ColorPresetPanel = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 18px);
  align-content: center;
  gap: 4px;
  height: 48px;
  box-sizing: border-box;
  padding: 4px;
  background: #e6edf7;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px #8ba4c6;
`;

export const CustomColorPickerPanel = styled.div`
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 6px;
  padding: 10px;
  height: 160px;
  box-sizing: border-box;
  border-radius: 8px;
  background: #e6edf7;
  box-shadow: inset 0 0 0 1px #8ba4c6;
`;

export const CustomColorPickerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const CustomColorPickerActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const CustomColorPickerMain = styled.div`
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16px 6px;
  gap: 8px;
`;

export const CustomColorSpectrum = styled.div`
  position: relative;
  min-width: 0;
  min-height: 0;
  border-radius: 6px;
  background-image:
    linear-gradient(to top, #000, transparent),
    linear-gradient(to right, #fff, hsl(${({ $hue }) => $hue}, 100%, 50%));
  box-shadow: inset 0 0 0 1px rgba(57, 81, 112, 0.22);
  cursor: crosshair;
  touch-action: none;
`;

export const CustomColorSpectrumThumb = styled.span`
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(26, 37, 48, 0.45);
  left: ${({ $saturation }) => `${$saturation}%`};
  top: ${({ $value }) => `${100 - $value}%`};
  transform: translate(-50%, -50%);
  pointer-events: none;
`;

export const CustomColorHueSlider = styled.input`
  width: 16px;
  min-height: 0;
  margin: 0;
  appearance: slider-vertical;
  accent-color: #3b82f6;
  cursor: ns-resize;
`;

export const CustomColorHueScale = styled.span`
  width: 6px;
  min-height: 0;
  border-radius: 999px;
  background: linear-gradient(
    to top,
    #ff0000 0%,
    #ff00ff 16.6%,
    #0000ff 33.3%,
    #00ffff 50%,
    #00ff00 66.6%,
    #ffff00 83.3%,
    #ff0000 100%
  );
  box-shadow: inset 0 0 0 1px rgba(57, 81, 112, 0.25);
`;

export const CustomColorInputs = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 38px 38px 38px;
  gap: 6px;
  align-items: end;
`;

export const CustomColorInputGroup = styled.label`
  display: grid;
  gap: 2px;

  > span {
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: #4a617d;
  }
`;

export const CustomColorInput = styled.input`
  width: 100%;
  height: 26px;
  box-sizing: border-box;
  border: none;
  border-radius: 6px;
  padding: 4px 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #1f3046;
  background: #f7fbff;
  box-shadow: inset 0 0 0 1px #a8bdd8;

  &:focus {
    outline: none;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #4f79b6, 0 0 0 2px rgba(0, 83, 255, 0.12);
  }

  &[type="number"] {
    -moz-appearance: textfield;
    appearance: textfield;
  }

  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export const CustomColorPickerPreview = styled.div`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #395170;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.02em;

  > span:last-child {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const CustomColorPickerPreviewSwatch = styled.span`
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  border-radius: 6px;
  background: ${({ $value }) => $value || "transparent"};
  box-shadow: inset 0 0 0 1px rgba(57, 81, 112, 0.18);
`;

export const CustomColorPickerCloseButton = styled.button`
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  border: none;
  border-radius: 999px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #395170;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;

  &:hover {
    background: #d2def2;
    color: #24384f;
  }

  &:focus-visible {
    outline: none;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #4f79b6, 0 0 0 2px rgba(0, 83, 255, 0.15);
  }
`;

export const CustomColorPickerActionButton = styled(CustomColorPickerCloseButton)`
  border-radius: 6px;
`;

export const ColorPresetRow = styled.div`
  display: ${({ $isUserRow }) => ($isUserRow ? "block" : "grid")};
  grid-auto-flow: column;
  grid-auto-columns: 18px;
  gap: 4px;
  min-height: 18px;
  align-items: center;
  justify-content: start;
`;

export const UserColorRow = styled.div`
  display: flex;
  /* grid-template-columns: auto auto; */
  gap: 4px;
  /* width: max-content; */
  min-height: 18px;
  align-items: center;
  justify-content: space-between;
`;

export const UserColorActions = styled.div`
  flex: 1 1 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  min-height: 18px;
`;

export const UserColorList = styled.div`
  display: inline-grid;
  grid-auto-flow: column;
  grid-auto-columns: 18px;
  gap: 4px;
  width: max-content;
  min-height: 18px;
  align-items: center;
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
  transition: outline-color 120ms ease, filter 120ms ease, opacity 120ms ease, background 120ms ease;

  &:hover {
    filter: brightness(1.04);
    outline-color: rgba(79, 121, 182, 0.7);
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
  /* background: #d9e5f6; */
  background: transparent;
  box-shadow: inset 0 0 0 1px #b6c8e2;
  position: relative;
  /* overflow: hidden; */
  outline: none;

  ${({ $deleteMode, $isDeleteToggle }) =>
    $deleteMode &&
    !$isDeleteToggle &&
    css`
      animation: ${userColorShake} 1s ease-in-out infinite;
    `}

  &:hover {
    background: #d2def2;
    filter: none;
    outline-color: rgba(79, 121, 182, 0.7);
    animation: none;
  }

  &:active {
    background: #becee8;
  }

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
`;

export const ColorPresetSwatch = styled.span`
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  background: ${({ $value }) => $value || "transparent"};

  &:hover {
    outline-width: 1px;
    outline-style: solid;
    outline-color: ${({ $value }) => $value || "transparent"};
  }
`;

export const UserColorPickerIcon = styled.span`
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: ${({ $iconColor }) => $iconColor || "#395170"};
  opacity: 0;
  transition: opacity 120ms ease;

  ${UserColorButton}:hover & {
    opacity: 1;
  }
`;

export const UserColorBanIcon = styled(UserColorPickerIcon)`
  color: ${({ $iconColor }) => $iconColor || "#8a2f0a"};
`;

export const UserColorDeleteToggleIcon = styled(UserColorPickerIcon)`
  color: #8a2f0a;
  opacity: 0.92;

  ${UserColorButton}:hover & {
    opacity: 1;
  }
`;

export const UserColorAddIcon = styled(UserColorPickerIcon)`
  color: ${({ $iconColor }) => $iconColor || "#395170"};
  opacity: 0.92;

  ${UserColorButton}:hover & {
    opacity: 1;
  }
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