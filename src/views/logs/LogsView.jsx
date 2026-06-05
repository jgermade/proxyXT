import { h } from "preact";
import { NewWindowSvg } from "../../components/icons/NewWindowSvg.jsx";
import {
  LogContext,
  LogEntryContainer,
  LogMain,
  LogsContent,
  LogsPanel,
  LogsToolbar,
  LogTime,
  OpenWindowButton,
  ToolbarActions,
  ToolbarTitle
} from "./LogsView.styles.jsx";

function toYaml(value, indent = 0) {
  const pad = "  ".repeat(indent);
  if (value === null || value === undefined) return "null";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string") {
    const needsQuote =
      value === "" ||
      /^[\s'\"]|[\n:#\[\]{}|>&*!@%`]|\s$/.test(value) ||
      value === "true" ||
      value === "false" ||
      value === "null" ||
      !Number.isNaN(Number(value));
    return needsQuote ? JSON.stringify(value) : value;
  }
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value
      .map((item) => {
        const rendered = toYaml(item, indent + 1);
        return typeof item === "object" && item !== null
          ? `${pad}-\n${"  ".repeat(indent + 1)}${rendered.trimStart()}`
          : `${pad}- ${rendered}`;
      })
      .join("\n");
  }
  if (typeof value === "object") {
    const keys = Object.keys(value);
    if (!keys.length) return "{}";
    return keys
      .map((key) => {
        const nestedValue = value[key];
        if (nestedValue !== null && typeof nestedValue === "object") {
          return `${pad}${key}:\n${toYaml(nestedValue, indent + 1)}`;
        }
        return `${pad}${key}: ${toYaml(nestedValue, indent)}`;
      })
      .join("\n");
  }
  return String(value);
}

function LogEntry({ log, t }) {
  const level = String(log.level || "info").toUpperCase();
  const message = String(log.message || t("messages.noMessage"));
  const rawTime = log.time ? new Date(log.time) : null;
  const time = rawTime && !Number.isNaN(rawTime.getTime()) ? rawTime.toLocaleString() : String(log.time || "");

  return (
    <LogEntryContainer>
      <LogTime>{time}</LogTime>
      <LogMain>{`${level}: ${message}`}</LogMain>
      {log.context ? <LogContext>{toYaml(log.context, 0)}</LogContext> : null}
    </LogEntryContainer>
  );
}

export function LogsView({ t, logs }) {
  function handleOpenInNewWindow() {
    const api = globalThis.browser ?? globalThis.chrome;
    const logsUrl = api?.runtime?.getURL ? api.runtime.getURL("logs.html") : "logs.html";
    globalThis.open(logsUrl, "_blank", "noopener,noreferrer,width=640,height=760");
  }

  const openInWindowLabel = t("buttons.logs.openInWindow");

  return (
    <LogsPanel>
      <LogsToolbar>
        <ToolbarTitle>{t("buttons.logs.title")}</ToolbarTitle>
        <ToolbarActions>
          <OpenWindowButton
            type="button"
            onClick={handleOpenInNewWindow}
            title={openInWindowLabel}
            aria-label={openInWindowLabel}
          >
            <NewWindowSvg width={14} height={14} />
          </OpenWindowButton>
        </ToolbarActions>
      </LogsToolbar>
      <LogsContent>
        {logs.length
          ? logs.map((log, index) => <LogEntry key={`${log.time || index}-${index}`} log={log} t={t} />)
          : t("messages.noLogs")}
      </LogsContent>
    </LogsPanel>
  );
}
