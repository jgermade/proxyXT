import { h } from "preact";
import styled from "styled-components";

const Wrapper = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const Control = styled.input`
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: var(--brand-blue);
`;

export function CheckboxField({ id, checked, onChange, label, className }) {
  return (
    <Wrapper className={className}>
      <Control
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
      <span>{label}</span>
    </Wrapper>
  );
}
