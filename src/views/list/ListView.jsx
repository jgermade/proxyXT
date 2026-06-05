import { h } from "preact";

function ServerItem({ server, activeServerId, onToggle, onEdit, getServerDisplayName, t }) {
  const alias = String(server?.name || "").trim();
  const endpoint = `${server.scheme}://${server.host}:${server.port}`;
  const isActive = server.id === activeServerId;

  return (
    <li className={`server-item${isActive ? " is-active" : ""}`}>
      <button type="button" className={`btn server-main${alias ? "" : " no-meta"}`} onClick={() => onToggle(server)}>
        <span className="server-name">{alias || `${server.host}:${server.port}`}</span>
        {alias ? <span className="server-meta">{endpoint}</span> : null}
      </button>
      <button
        type="button"
        className="btn server-edit-btn"
        title={t("buttons.server.edit")}
        aria-label={`${t("buttons.server.edit")} ${getServerDisplayName(server)}`}
        onClick={() => onEdit(server)}
      >
        ✎
      </button>
    </li>
  );
}

export function ListView({ t, view, servers, activeServerId, onToggle, onEdit, getServerDisplayName }) {
  return (
    <section className={`view-panel${view === "list" ? "" : " hidden"}`}>
      <div className="list-container">
        <ul className="server-list">
            {servers.map((server) => (
            <ServerItem
                key={server.id}
                server={server}
                activeServerId={activeServerId}
                onToggle={onToggle}
                onEdit={onEdit}
                getServerDisplayName={getServerDisplayName}
                t={t}
            />
            ))}
        </ul>
        <div className={`empty-state-card${servers.length ? " hidden" : ""}`}>{t("messages.noServers")}</div>
      </div>
    </section>
  );
}
