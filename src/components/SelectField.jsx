import { h } from "preact";
import styled from "styled-components";

const Label = styled.label`
  display: grid;
  gap: 0;
`;

const FieldFrame = styled.span`
  position: relative;
  display: block;
`;

const LabelText = styled.span`
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #476080;
  pointer-events: none;
`;

const Control = styled.select`
  width: 100%;
  border: none;
  border-radius: 8px;
  padding: 24px 8px 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f3046;
  background: #e6edf7;
  box-shadow: inset 0 0 0 1px #8ba4c6;
  transition: background 120ms ease, box-shadow 120ms ease;
  appearance: base-select;

  &:focus {
    outline: none;
    background: #e9f1ff;
    box-shadow: inset 0 0 0 1px #4f79b6, 0 0 0 2px rgba(0, 83, 255, 0.15);
  }
`;

export function SelectField({ label, id, value, onChange, options = [] }) {
  return (
    <Label>
      <FieldFrame>
        <LabelText>{label}</LabelText>
        <Control
          id={id}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Control>
      </FieldFrame>
    </Label>
  );
}
