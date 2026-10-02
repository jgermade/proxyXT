import styled, { keyframes } from "styled-components";
import { CheckboxField } from "../../components/form/CheckboxField.jsx";

const slowGearSpin = keyframes`
  from {
    transform: translateY(-1px) rotate(0deg);
  }

  to {
    transform: translateY(-1px) rotate(360deg);
  }
`;

const gearBoostSpin = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(1080deg);
  }
`;

export const PreferencesPanel = styled.section`
  min-height: 208px;
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
`;

export const PreferencesForm = styled.form`
  display: grid;
  gap: 8px;
  padding: 16px;
  background: #f4f8ff;
`;

export const PreferencesGroup = styled.div`
  display: grid;
  gap: 10px;
`;

export const PreferencesSeparator = styled.div`
  height: 1px;
  background: #c1d1e3;
  margin: 2px 0;
`;

export const PreferenceToggle = styled(CheckboxField)`
  font-size: 0.86rem;
  font-weight: 600;
  color: #1f3146;
`;

export const PreferencesHintBox = styled.div`
  min-height: 100px;
  max-height: 100px;
  box-sizing: border-box;
  margin-top: 2px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #edf3fc;
  box-shadow: inset 0 0 0 1px #c5d4e9;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  position: relative;
  overflow: hidden;
  cursor: pointer;
`;

export const PreferencesHintText = styled.p`
  margin: 0;
  font-size: 0.78rem;
  color: #3d556e;
  line-height: 1.35;
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

export const PreferencesHintPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3d556e;
  opacity: ${({ $isHintActive }) => ($isHintActive ? 0.025 : 0.05)};
  transform: translateY(-1px);
  animation: ${slowGearSpin} 18s linear infinite;
  pointer-events: none;

  > svg {
    animation: ${({ $isBoosted }) => ($isBoosted ? gearBoostSpin : "none")} 3s ease-in-out 1;
    transform-origin: center;
  }
`;