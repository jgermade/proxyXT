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
  top: 5px;
  left: 8px;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  color: #476080;
  pointer-events: none;
`;

const Control = styled.input`
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  border: none;
  border-radius: 8px;
  padding: 22px 8px 6px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1f3046;
  background: #e6edf7;
  box-shadow: inset 0 0 0 1px #8ba4c6;
  transition: background 120ms ease, box-shadow 120ms ease;
  appearance: none;

  &::placeholder {
    color: #b0c2da;
  }

  &:focus {
    outline: none;
    background: white;
    box-shadow: inset 0 0 0 1px #4f79b6, 0 0 0 2px rgba(0, 83, 255, 0.15);
  }
`;

export function InputField({ label, id, value, onInput, type = "text", inputRef, ...rest }) {
  return (
    <Label>
      <FieldFrame>
        <LabelText>{label}</LabelText>
        <Control
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          onInput={(event) => onInput(event.currentTarget.value)}
          {...rest}
        />
      </FieldFrame>
    </Label>
  );
}
