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

export const ListPanel = styled.section`
  min-height: 192px;
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

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    background: ${({ $rowColor }) => $rowColor || "var(--brand-orange)"};
    opacity: ${({ $isActive }) => ($isActive ? 0 : 1)};
    pointer-events: none;
    z-index: 2;
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
  background: ${({ $isActive, $activeColor }) => ($isActive ? $activeColor : "var(--surface)")};
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

  &:hover {
    background: ${({ $isActive, $activeColor }) => ($isActive ? $activeColor : "#f4f8ff")};
  }

  &:active {
    background: ${({ $isActive, $activeColor }) => ($isActive ? $activeColor : "#eaf1fb")};
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
  background: ${({ $isActive, $activeColor }) => ($isActive ? $activeColor : "var(--surface)")};
  color: ${({ $isActive, $activeTextColor }) => ($isActive ? $activeTextColor : "#1a2530")};
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  display: grid;
  place-items: center;
  transition: background 120ms ease, color 120ms ease;
  cursor: pointer;

  &:hover {
    background: #ffd9c4;
    color: #8d2f00;
    filter: none;
  }

  &:active {
    background: #ffc9ab;
    color: #7d2a00;
  }
`;

export const EmptyStateCard = styled.div`
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