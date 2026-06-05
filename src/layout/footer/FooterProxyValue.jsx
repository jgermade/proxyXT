import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { StyledFooterProxyValue } from "./FooterProxyValue.styles.jsx";

const VALUE_TRANSITION_MS = 300;

export function FooterProxyValue({ children, isActive = false }) {
  const value = children ?? "";
  const [currentValue, setCurrentValue] = useState(value);
  const [outgoingValue, setOutgoingValue] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef(null);
  const skipNextAnimationRef = useRef(true);

  useEffect(() => {
    if (value === currentValue) {
      return undefined;
    }

    if (skipNextAnimationRef.current) {
      skipNextAnimationRef.current = false;
      if (timerRef.current) {
        globalThis.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setOutgoingValue(null);
      setCurrentValue(value);
      setIsAnimating(false);
      return undefined;
    }

    if (timerRef.current) {
      globalThis.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setOutgoingValue(currentValue);
    setCurrentValue(value);
    setIsAnimating(true);

    timerRef.current = globalThis.setTimeout(() => {
      setOutgoingValue(null);
      setIsAnimating(false);
      timerRef.current = null;
    }, VALUE_TRANSITION_MS);

    return undefined;
  }, [value, currentValue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        globalThis.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return (
    <StyledFooterProxyValue $isActive={isActive} $isAnimating={isAnimating}>
      {isAnimating ? <span data-role="outgoing">{outgoingValue}</span> : null}
      <span data-role="incoming" data-animate={isAnimating ? "true" : "false"}>
        {currentValue}
      </span>
    </StyledFooterProxyValue>
  );
}