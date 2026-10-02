import styled, { css, keyframes } from "styled-components";

const cardEnter = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const driftOverlay = keyframes`
  0% {
    transform: translate(0, 0);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }

  16% {
    transform: translate(-34px, -20px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }

  32% {
    transform: translate(30px, -34px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }

  48% {
    transform: translate(46px, 14px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }

  64% {
    transform: translate(-24px, 38px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }

  80% {
    transform: translate(-48px, -10px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }

  92% {
    transform: translate(12px, -22px);
    animation-timing-function: cubic-bezier(0.42, 0, 0.58, 1);
  }

  100% {
    transform: translate(0, 0);
  }
`;

// Light shapes (for dark backgrounds)
const STAR_L    = `url("data:image/svg+xml,%3Csvg width='50' height='40' viewBox='0 0 50 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='25,16 26.5,19.5 30,21 26.5,22.5 25,26 23.5,22.5 20,21 23.5,19.5' fill='%23c8d8e8' opacity='0.12'/%3E%3C/svg%3E")`;
const STAR_SM_L = `url("data:image/svg+xml,%3Csvg width='40' height='32' viewBox='0 0 40 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='20,13 21,15.5 24,16.5 21,17.5 20,20 19,17.5 16,16.5 19,15.5' fill='%23c8d8e8' opacity='0.08'/%3E%3C/svg%3E")`;
const MOON_L    = `url("data:image/svg+xml,%3Csvg width='80' height='56' viewBox='0 0 80 56' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' d='M40,19 A9,9,0,1,0,40,37 A9,9,0,1,0,40,19 Z M38,22 A6,6,0,1,0,38,34 A6,6,0,1,0,38,22 Z' fill='%23c8d8e8' opacity='0.09'/%3E%3C/svg%3E")`;
const MOON_SM_L = `url("data:image/svg+xml,%3Csvg width='60' height='44' viewBox='0 0 60 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' d='M30,15 A7,7,0,1,0,30,29 A7,7,0,1,0,30,15 Z M28,17.4 A4.6,4.6,0,1,0,28,26.6 A4.6,4.6,0,1,0,28,17.4 Z' fill='%23c8d8e8' opacity='0.06'/%3E%3C/svg%3E")`;

// Dark shapes (for light backgrounds)
const STAR_D    = `url("data:image/svg+xml,%3Csvg width='50' height='40' viewBox='0 0 50 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='25,16 26.5,19.5 30,21 26.5,22.5 25,26 23.5,22.5 20,21 23.5,19.5' fill='%231e3246' opacity='0.08'/%3E%3C/svg%3E")`;
const STAR_SM_D = `url("data:image/svg+xml,%3Csvg width='40' height='32' viewBox='0 0 40 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='20,13 21,15.5 24,16.5 21,17.5 20,20 19,17.5 16,16.5 19,15.5' fill='%231e3246' opacity='0.06'/%3E%3C/svg%3E")`;
const MOON_D    = `url("data:image/svg+xml,%3Csvg width='80' height='56' viewBox='0 0 80 56' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' d='M40,19 A9,9,0,1,0,40,37 A9,9,0,1,0,40,19 Z M38,22 A6,6,0,1,0,38,34 A6,6,0,1,0,38,22 Z' fill='%231e3246' opacity='0.07'/%3E%3C/svg%3E")`;
const MOON_SM_D = `url("data:image/svg+xml,%3Csvg width='60' height='44' viewBox='0 0 60 44' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' d='M30,15 A7,7,0,1,0,30,29 A7,7,0,1,0,30,15 Z M28,17.4 A4.6,4.6,0,1,0,28,26.6 A4.6,4.6,0,1,0,28,17.4 Z' fill='%231e3246' opacity='0.05'/%3E%3C/svg%3E")`;

export const ListPanel = styled.section`
  min-height: 208px;
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
`;

export const ListContainer = styled.div`
  padding: 16px;
`;

export const ServerList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
`;

export const ServerRowContainer = styled.li`
  position: relative;
  min-height: 48px;
  list-style: none;
  transition: transform 120ms ease;

  ${({ $isDropTarget }) =>
    $isDropTarget &&
    css`
      transform: translateY(-1px);
    `}
`;

export const ServerListItem = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: 0;
  min-height: 48px;
  border-radius: 11px;
  overflow: hidden;
  position: relative;
  animation: ${cardEnter} 220ms ease both;
  cursor: ${({ $isDragging }) => ($isDragging ? "grabbing" : "grab")};
  user-select: none;
  background: ${({ $isActive, $rowColor }) => ($isActive ? $rowColor || "var(--brand-orange)" : "transparent")};
  transition: background 120ms ease;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background: ${({ $rowColor }) => $rowColor || "var(--brand-orange)"};
    opacity: ${({ $isActive }) => ($isActive ? 0 : 0.60)};
    pointer-events: none;
    z-index: 4;
    transition: opacity 120ms ease;
  }

  &:hover::before {
    opacity: ${({ $isActive }) => ($isActive ? 0 : 1)};
  }
`;

export const ServerDragPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  border: 1px dashed #8fb0d9;
  border-radius: 11px;
  background: rgba(203, 220, 244, 0.8);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  pointer-events: none;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 120ms ease;
`;

export const ServerMainButton = styled.button`
  flex: 1;
  border: none;
  background: ${({ $isActive }) => ($isActive ? "transparent" : "var(--surface)")};
  color: ${({ $isActive, $activeTextColor }) => ($isActive ? $activeTextColor : "#1a2530")};
  padding: 8px 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  text-align: left;
  transition: background 120ms ease;
  min-height: ${({ $noMeta }) => ($noMeta ? "48px" : "auto")};
  justify-content: ${({ $noMeta }) => ($noMeta ? "center" : "flex-start")};
  cursor: pointer;
  position: relative;
  z-index: 2;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? "transparent" : "#f4f8ff")};
  }

  &:active {
    background: ${({ $isActive }) => ($isActive ? "transparent" : "#eaf1fb")};
  }
`;

export const ServerName = styled.span`
  font-weight: 700;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $isActive, $activeTextColor }) => ($isActive ? $activeTextColor : "#1a2530")};
`;

export const ServerMeta = styled.span`
  font-size: 0.8rem;
  color: ${({ $isActive, $activeMetaColor }) => ($isActive ? $activeMetaColor : "#1f3249")};
  font-weight: 500;
`;

export const ServerEditButton = styled.button`
  min-width: 35px;
  border: none;
  background: ${({ $isActive }) => ($isActive ? "transparent" : "var(--surface)")};
  color: ${({ $isActive, $activeTextColor }) => ($isActive ? $activeTextColor : "#1a2530")};
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  display: grid;
  place-items: center;
  transition: background 120ms ease, color 120ms ease;
  cursor: pointer;
  position: relative;
  z-index: 2;
  isolation: isolate;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background: ${({ $activeHoverOverlay }) => $activeHoverOverlay || "rgba(255, 255, 255, 0.22)"};
    opacity: 0;
    pointer-events: none;
    transition: opacity 120ms ease, background 120ms ease;
    z-index: -1;
  }

  &:hover {
    background: ${({ $isActive }) => ($isActive ? "transparent" : "#ffd9c4")};
    color: ${({ $isActive, $activeTextColor }) => ($isActive ? $activeTextColor : "#8d2f00")};
    filter: none;
  }

  &:hover::before {
    opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
  }

  &:active {
    background: ${({ $isActive }) => ($isActive ? "transparent" : "#ffc9ab")};
    color: ${({ $isActive, $activeTextColor }) => ($isActive ? $activeTextColor : "#7d2a00")};
  }

  &:active::before {
    background: ${({ $activeHoverOverlayStrong }) => $activeHoverOverlayStrong || "rgba(255, 255, 255, 0.3)"};
    opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
  }
`;

export const EmptyStateForm = styled.form`
  background: #f7faff;
  border: 1px dashed #c1d1e3;
  color: #425773;
  border-radius: 11px;
  padding: 16px 8px;
  text-align: center;
  margin: 8px 0;
  font-size: 0.84rem;
  display: ${({ $isVisible }) => ($isVisible ? "block" : "none")};
`;

export const EmptyStateMessage = styled.div`
  margin: 0;
`;

export const EmptyStateActionButton = styled.button`
  margin-top: 10px;
  border: none;
  border-radius: 9px;
  padding: 8px 12px;
  background: var(--brand-blue);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease;

  &:hover {
    background: #0967d4;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(9, 103, 212, 0.24);
  }
`;

export const EmptyStateSecondaryButton = styled.button`
  margin-top: 10px;
  border: 1px solid #c1d1e3;
  border-radius: 9px;
  padding: 8px 12px;
  background: transparent;
  color: #425773;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease;

  &:hover {
    background: #eaf1fb;
    border-color: #8fb0d9;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(9, 103, 212, 0.24);
  }
`;

export const EmptyStateDivider = styled.div`
  margin: 12px auto 0;
  font-size: 0.75rem;
  color: #b0c4db;
  letter-spacing: 0.08em;
  user-select: none;
`;

export const ServerActivePatternOverlay = styled.span`
  position: absolute;
  inset: -60px;
  pointer-events: none;
  z-index: 3;
  will-change: transform;
  background:
    ${({ $v }) => $v === "dark" ? STAR_D    : STAR_L}    0    0    / 68px 52px repeat,
    ${({ $v }) => $v === "dark" ? STAR_SM_D : STAR_SM_L} 34px 26px / 54px 42px repeat,
    ${({ $v }) => $v === "dark" ? MOON_D    : MOON_L}    10px 5px  / 100px 72px repeat,
    ${({ $v }) => $v === "dark" ? MOON_SM_D : MOON_SM_L} 60px 36px / 76px 56px repeat;
  animation: ${driftOverlay} 30s infinite;
`;