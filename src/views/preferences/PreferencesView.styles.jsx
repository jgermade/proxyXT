import styled from "styled-components";
import { CheckboxField } from "../../components/form/CheckboxField.jsx";

export const PreferencesPanel = styled.section`
  min-height: 192px;
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
`;

export const PreferencesCard = styled.div`
  display: grid;
  gap: 8px;
  padding: 16px;
`;

export const PreferencesGroup = styled.div`
  display: grid;
  gap: 12px;
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

export const PreferencesHelp = styled.p`
  margin: 0 0 0 28px;
  font-size: 0.78rem;
  color: #3d556e;
  line-height: 1.35;
`;