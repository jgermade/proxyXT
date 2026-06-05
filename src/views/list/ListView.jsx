import { h } from "preact";
import {
  EmptyStateActionButton,
  EmptyStateCard,
  EmptyStateMessage,
  ListContainer,
  ListPanel,
  ServerEditButton,
  ServerListItem,
  ServerList,
  ServerMainButton,
  ServerMeta,
  ServerName
} from "./ListView.styles.jsx";

function ServerRow({ server, activeServerId, onToggle, onEdit, getServerDisplayName, t }) {
  const alias = String(server?.name || "").trim();
  const endpoint = `${server.scheme}://${server.host}:${server.port}`;
  const isActive = server.id === activeServerId;
  const hasMeta = Boolean(alias);

  return (
    <ServerListItem>
      <ServerMainButton type="button" $isActive={isActive} $noMeta={!hasMeta} onClick={() => onToggle(server)}>
        <ServerName $isActive={isActive}>{alias || `${server.host}:${server.port}`}</ServerName>
        {hasMeta ? <ServerMeta $isActive={isActive}>{endpoint}</ServerMeta> : null}
      </ServerMainButton>
      <ServerEditButton
        type="button"
        $isActive={isActive}
        title={t("buttons.server.edit")}
        aria-label={`${t("buttons.server.edit")} ${getServerDisplayName(server)}`}
        onClick={() => onEdit(server)}
      >
        ✎
      </ServerEditButton>
    </ServerListItem>
  );
}

export function ListView({ t, view, servers, activeServerId, onToggle, onEdit, getServerDisplayName, onAddServer }) {
  const isEmpty = !servers.length;

  return (
    <ListPanel $isVisible={view === "list"}>
      <ListContainer>
        <ServerList>
          {servers.map((server) => (
            <ServerRow
              key={server.id}
              server={server}
              activeServerId={activeServerId}
              onToggle={onToggle}
              onEdit={onEdit}
              getServerDisplayName={getServerDisplayName}
              t={t}
            />
          ))}
        </ServerList>
        <EmptyStateCard $isVisible={isEmpty}>
          <EmptyStateMessage>{t("messages.noServers")}</EmptyStateMessage>
          <EmptyStateActionButton type="button" onClick={onAddServer}>
            {t("app.subtitle.addProxy")}
          </EmptyStateActionButton>
        </EmptyStateCard>
      </ListContainer>
    </ListPanel>
  );
}
