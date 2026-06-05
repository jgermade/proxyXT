import { h } from "preact";
import styled from "styled-components";

const Control = styled.button`
  width: 48px;
  height: 48px;
  box-sizing: border-box;
  border: none;
  border-radius: 8px;
  padding: 4px;
  background: #e6edf7;
  box-shadow: inset 0 0 0 1px #8ba4c6;
  transition: background 120ms ease, box-shadow 120ms ease;
  cursor: pointer;
  appearance: none;
  display: inline-flex;
  align-items: stretch;
  justify-content: stretch;

  &:focus-visible {
    outline: none;
    background: white;
    box-shadow: inset 0 0 0 1px #4f79b6, 0 0 0 2px rgba(0, 83, 255, 0.15);
  }

  &:hover {
    background: #edf4ff;
  }
`;

const Swatch = styled.span`
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 5px;
  background: ${({ $value }) => $value};
`;

export function ColorField({ label, id, value, onClick, ...rest }) {
  return (
    <Control
      id={id}
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      {...rest}
    >
      <Swatch $value={value} aria-hidden="true" />
    </Control>
  );
}
