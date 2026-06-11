import { Fragment, h } from "preact";
import { useState } from "preact/hooks";
import {
  EmptyStateActionButton,
  EmptyStateForm,
  EmptyStateDivider,
  EmptyStateMessage,
  EmptyStateSecondaryButton,
  ListContainer,
  ListPanel,
  ServerActivePatternOverlay,
  ServerDragPlaceholder,
  ServerEditButton,
  ServerRowContainer,
  ServerListItem,
  ServerList,
  ServerMainButton,
  ServerMeta,
  ServerName
} from "./ListView.styles.jsx";
import { DEFAULT_SELECTION_COLOR } from "../../lib/state.js";
import { getContrastingTextColor } from "../../lib/colors.js";

function ServerRow({
  server,
  activeServerId,
  onToggle,
  onEdit,
  getServerDisplayName,
  t,
  isDragging,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd
}) {
  const alias = String(server?.name || "").trim();
  const endpoint = `${server.scheme}://${server.host}:${server.port}`;
  const isActive = server.id === activeServerId;
  const hasMeta = Boolean(alias);
  const activeColor = String(server.selectionColor || DEFAULT_SELECTION_COLOR).trim().toUpperCase();
  const activeTextColor = getContrastingTextColor(activeColor);
  const activeMetaColor = activeTextColor === "#ffffff" ? "rgba(255,255,255,0.82)" : "rgba(26,37,48,0.82)";
  const activePatternVariant = activeTextColor === "#ffffff" ? "light" : "dark";
  const activeEditHoverOverlay =
    activeTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.2)" : "rgba(26, 37, 48, 0.14)";
  const activeEditHoverOverlayStrong =
    activeTextColor === "#ffffff" ? "rgba(255, 255, 255, 0.28)" : "rgba(26, 37, 48, 0.2)";

  return (
    <ServerRowContainer>
      <ServerListItem
        draggable={true}
        $isDragging={isDragging}
        $isActive={isActive}
        $rowColor={activeColor}
        onDragStart={(event) => onDragStart(event, server.id)}
        onDragOver={(event) => onDragOver(event, server.id)}
        onDrop={(event) => {
          event.stopPropagation();
          onDrop(event, server.id);
        }}
        onDragEnd={onDragEnd}
      >
        {isActive ? <ServerActivePatternOverlay $v={activePatternVariant} /> : null}
        <ServerMainButton
          type="button"
          $isActive={isActive}
          $activeColor={activeColor}
          $activeTextColor={activeTextColor}
          $noMeta={!hasMeta}
          onClick={() => onToggle(server)}
        >
          <ServerName $isActive={isActive} $activeTextColor={activeTextColor}>{alias || `${server.host}:${server.port}`}</ServerName>
          {hasMeta ? <ServerMeta $isActive={isActive} $activeMetaColor={activeMetaColor}>{endpoint}</ServerMeta> : null}
        </ServerMainButton>
        <ServerEditButton
          type="button"
          $isActive={isActive}
          $activeColor={activeColor}
          $activeTextColor={activeTextColor}
          $activeHoverOverlay={activeEditHoverOverlay}
          $activeHoverOverlayStrong={activeEditHoverOverlayStrong}
          title={t("buttons.server.edit")}
          aria-label={`${t("buttons.server.edit")} ${getServerDisplayName(server)}`}
          onClick={() => onEdit(server)}
        >
          ✎
        </ServerEditButton>
      </ServerListItem>
      <ServerDragPlaceholder $isVisible={isDragging} aria-hidden="true" />
    </ServerRowContainer>
  );
}

export function ListView({
  t,
  view,
  isInitialStateLoading,
  servers,
  activeServerId,
  onToggle,
  onEdit,
  getServerDisplayName,
  onAddServer,
  onReorder,
  syncServersWithAccount,
  onActivateSync
}) {
  const isEmpty = !servers.length;
  const showEmptyState = !isInitialStateLoading && isEmpty;
  const [draggedServerId, setDraggedServerId] = useState(null);
  const [dragInsertIndex, setDragInsertIndex] = useState(null);

  function clearDragState() {
    setDraggedServerId(null);
    setDragInsertIndex(null);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getDraggedServer(sourceServerId = draggedServerId) {
    return servers.find((server) => server.id === sourceServerId) || null;
  }

  function getRemainingServers(sourceServerId = draggedServerId) {
    return servers.filter((server) => server.id !== sourceServerId);
  }

  function buildPreviewServers(sourceServerId, insertionIndex) {
    const draggedServer = getDraggedServer(sourceServerId);
    if (!draggedServer) {
      return servers;
    }

    const remaining = getRemainingServers(sourceServerId);
    const nextIndex = clamp(insertionIndex, 0, remaining.length);
    const preview = remaining.slice();
    preview.splice(nextIndex, 0, draggedServer);
    return preview;
  }

  function handleDragStart(event, serverId) {
    setDraggedServerId(serverId);
    const index = servers.findIndex((server) => server.id === serverId);
    setDragInsertIndex(index >= 0 ? index : null);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", serverId);
  }

  function handleDragOver(event, serverId) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    const sourceServerId = draggedServerId || event.dataTransfer.getData("text/plain");
    if (!sourceServerId) {
      return;
    }

    if (serverId === sourceServerId) {
      return;
    }

    const remaining = getRemainingServers(sourceServerId);
    const overIndex = remaining.findIndex((server) => server.id === serverId);
    if (overIndex < 0) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const insertAfter = event.clientY > rect.top + rect.height / 2;
    const nextIndex = clamp(overIndex + (insertAfter ? 1 : 0), 0, remaining.length);
    if (nextIndex !== dragInsertIndex) {
      setDragInsertIndex(nextIndex);
    }
  }

  function handleDrop(event, serverId) {
    event.preventDefault();
    const sourceServerId = draggedServerId || event.dataTransfer.getData("text/plain");
    const remaining = getRemainingServers(sourceServerId);
    const insertionIndex = Number.isInteger(dragInsertIndex)
      ? clamp(dragInsertIndex, 0, remaining.length)
      : remaining.findIndex((server) => server.id === serverId);
    const targetServerId = insertionIndex >= remaining.length ? null : remaining[insertionIndex]?.id || null;

    clearDragState();
    if (!sourceServerId || sourceServerId === targetServerId) {
      return;
    }
    onReorder?.(sourceServerId, targetServerId);
  }

  function handleListDrop(event) {
    event.preventDefault();
    const sourceServerId = draggedServerId || event.dataTransfer.getData("text/plain");
    const remaining = getRemainingServers(sourceServerId);
    const insertionIndex = Number.isInteger(dragInsertIndex)
      ? clamp(dragInsertIndex, 0, remaining.length)
      : remaining.length;
    const targetServerId = insertionIndex >= remaining.length ? null : remaining[insertionIndex]?.id || null;
    clearDragState();
    if (!sourceServerId) {
      return;
    }
    if (sourceServerId === targetServerId) {
      return;
    }

    onReorder?.(sourceServerId, targetServerId);
  }

  function handleListDragOver(event) {
    event.preventDefault();
    const sourceServerId = draggedServerId || event.dataTransfer.getData("text/plain");
    if (!sourceServerId) {
      return;
    }

    if (event.target !== event.currentTarget) {
      return;
    }

    const remaining = getRemainingServers(sourceServerId);
    const listRect = event.currentTarget.getBoundingClientRect();
    const nextIndex = event.clientY < listRect.top + 8 ? 0 : remaining.length;
    if (nextIndex !== dragInsertIndex) {
      setDragInsertIndex(nextIndex);
    }
  }

  const renderedServers = draggedServerId && Number.isInteger(dragInsertIndex)
    ? buildPreviewServers(draggedServerId, dragInsertIndex)
    : servers;

  return (
    <ListPanel $isVisible={view === "list"}>
      <ListContainer>
        <ServerList onDragOver={handleListDragOver} onDrop={handleListDrop}>
          {renderedServers.map((server) => (
            <ServerRow
              key={server.id}
              server={server}
              activeServerId={activeServerId}
              onToggle={onToggle}
              onEdit={onEdit}
              getServerDisplayName={getServerDisplayName}
              t={t}
              isDragging={draggedServerId === server.id}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={clearDragState}
            />
          ))}
        </ServerList>
        <EmptyStateForm $isVisible={showEmptyState} name="emptyState">
          <EmptyStateMessage>{t("messages.noServers")}</EmptyStateMessage>
          <EmptyStateActionButton type="button" onClick={onAddServer} name="addServer">
            {t("app.subtitle.addProxy")}
          </EmptyStateActionButton>
          {!syncServersWithAccount ? (
            <>
              <EmptyStateDivider>&mdash; o &mdash;</EmptyStateDivider>
              <EmptyStateSecondaryButton type="button" onClick={onActivateSync} name="activateSync">
                {t("messages.noServersSync")}
              </EmptyStateSecondaryButton>
            </>
          ) : null}
        </EmptyStateForm>
      </ListContainer>
    </ListPanel>
  );
}