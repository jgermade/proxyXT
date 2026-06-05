import styled, { keyframes } from "styled-components";

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

export const ServerListItem = styled.li`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: stretch;
  gap: 0;
  animation: ${cardEnter} 220ms ease both;
`;

export const ServerMainButton = styled.button`
  flex: 1;
  border: none;
  background: ${({ $isActive }) => ($isActive ? "rgb(255,84,0)" : "var(--surface)")};
  color: inherit;
  padding: 8px 16px;
  border-radius: 11px 0 0 11px;
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
    background: ${({ $isActive }) => ($isActive ? "rgb(255,84,0)" : "#f4f8ff")};
  }

  &:active {
    background: ${({ $isActive }) => ($isActive ? "rgb(255,84,0)" : "#eaf1fb")};
  }
`;

export const ServerName = styled.span`
  font-weight: 700;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ $isActive }) => ($isActive ? "#ffffff" : "#1a2530")};
`;

export const ServerMeta = styled.span`
  font-size: 0.8rem;
  color: ${({ $isActive }) => ($isActive ? "#ffe3d5" : "#1f3249")};
  font-weight: 500;
`;

export const ServerEditButton = styled.button`
  min-width: 35px;
  border: none;
  border-radius: 0 11px 11px 0;
  background: ${({ $isActive }) => ($isActive ? "#ffd8c2" : "#ffffff")};
  color: ${({ $isActive }) => ($isActive ? "#1a2530" : "#4f6785")};
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  display: grid;
  place-items: center;
  transition: background 120ms ease, color 120ms ease;
  cursor: pointer;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? "#ffd8c2" : "#234a75")};
    color: ${({ $isActive }) => ($isActive ? "#1a2530" : "#ffffff")};
    filter: none;
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