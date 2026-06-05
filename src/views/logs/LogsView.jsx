import { h } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { BanSymbolSvg } from "../../components/icons/BanSymbolSvg.jsx";
import { CopySymbolSvg } from "../../components/icons/CopySymbolSvg.jsx";
import { CrossSymbolSvg } from "../../components/icons/CrossSymbolSvg.jsx";
import { FilterSymbolSvg } from "../../components/icons/FilterSymbolSvg.jsx";
import { LogsSvg } from "../../components/icons/LogsSvg.jsx";
import { SadFaceSvg } from "../../components/icons/SadFaceSvg.jsx";
import { NewWindowSvg } from "../../components/icons/NewWindowSvg.jsx";
import {
  CopyLogsButton,
  CloseWindowButton,
  ClearLogsButton,
  ConfirmCard,
  ConfirmDangerButton,
  ConfirmDismissButton,
  ConfirmOverlay,
  ConfirmText,
  EmptyLogsIllustration,
  EmptyLogsSadFaceMotion,
  EmptyLogsState,
  FilterCheckbox,
  FilterLabel,
  FilterMenu,
  FilterMenuPanel,
  FilterTextButton,
  FilterToggleButton,
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

const LOG_LEVELS = ["success", "info", "warning", "error", "debug"];
const FEEDBACK_QUICK_DURATION_MS = 500;
const SAD_EASTER_EGG_DURATION_MS = 4000;

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
  const rawLevel = String(log.level || "info").toLowerCase();
  const normalizedLevel = rawLevel === "warn" ? "warning" : rawLevel;
  const level = normalizedLevel.toUpperCase();
  const message = String(log.message || t("messages.noMessage"));
  const rawTime = log.time ? new Date(log.time) : null;
  const time = rawTime && !Number.isNaN(rawTime.getTime()) ? rawTime.toLocaleString() : String(log.time || "");

  return (
    <LogEntryContainer $level={normalizedLevel}>
      <LogTime>{time}</LogTime>
      <LogMain>{`${level}: ${message}`}</LogMain>
      {log.context ? <LogContext>{toYaml(log.context, 0)}</LogContext> : null}
    </LogEntryContainer>
  );
}

function serializeLogForClipboard(log) {
  const rawLevel = String(log.level || "info").toLowerCase();
  const normalizedLevel = rawLevel === "warn" ? "warning" : rawLevel;
  const time = String(log.time || "");
  const message = String(log.message || "");
  const contextBlock = log.context ? `\ncontext:\n${toYaml(log.context, 1)}` : "";
  return `${time} [${normalizedLevel.toUpperCase()}] ${message}${contextBlock}`;
}

export function LogsView({ t, logs, onClose, onClearLogs, onFeedback }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isConfirmClosing, setIsConfirmClosing] = useState(false);
  const [emptyStateShakeNonce, setEmptyStateShakeNonce] = useState(0);
  const [emptyClearClicks, setEmptyClearClicks] = useState(0);
  const [isSadEasterEggActive, setIsSadEasterEggActive] = useState(false);
    const closeConfirmTimerRef = useRef(null);
  const sadEasterEggTimerRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const filterMenuRef = useRef(null);

    useEffect(() => {
      return () => {
        if (closeConfirmTimerRef.current) {
          globalThis.clearTimeout(closeConfirmTimerRef.current);
          closeConfirmTimerRef.current = null;
        }
        if (sadEasterEggTimerRef.current) {
          globalThis.clearTimeout(sadEasterEggTimerRef.current);
          sadEasterEggTimerRef.current = null;
        }
      };
    }, []);

  useEffect(() => {
    if (!isConfirmOpen) {
      return undefined;
    }

    const focusTimer = globalThis.setTimeout(() => {
      confirmButtonRef.current?.focus?.();
    }, 0);

    return () => {
      globalThis.clearTimeout(focusTimer);
    };
  }, [isConfirmOpen]);

  useEffect(() => {
    if (!isConfirmOpen) {
      return undefined;
    }

    function handleEscapeKey(event) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      handleDismissClearConfirm();
    }

    globalThis.addEventListener("keydown", handleEscapeKey, true);
    return () => {
      globalThis.removeEventListener("keydown", handleEscapeKey, true);
    };
  }, [isConfirmOpen]);

  useEffect(() => {
    function handlePointerDownOutsideFilterMenu(event) {
      const menuElement = filterMenuRef.current;
      if (!menuElement || !menuElement.hasAttribute("open")) {
        return;
      }

      const targetNode = event.target;
      if (targetNode && menuElement.contains(targetNode)) {
        return;
      }

      menuElement.removeAttribute("open");
    }

    globalThis.addEventListener("pointerdown", handlePointerDownOutsideFilterMenu, true);
    return () => {
      globalThis.removeEventListener("pointerdown", handlePointerDownOutsideFilterMenu, true);
    };
  }, []);

  const [levelFilters, setLevelFilters] = useState({
    success: true,
    info: true,
    warning: true,
    error: true,
    debug: true
  });

  function handleOpenInNewWindow() {
    const api = globalThis.browser ?? globalThis.chrome;
    const logsUrl = api?.runtime?.getURL ? api.runtime.getURL("logs.html") : "logs.html";
    globalThis.open(logsUrl, "_blank", "noopener,noreferrer,width=640,height=760");
  }

  const openInWindowLabel = t("buttons.logs.openInWindow");
  const closeWindowLabel = t("buttons.logs.closeWindow");
  const filtersLabel = t("buttons.logs.filters");
  const clearLogsLabel = t("buttons.logs.clear");
  const copyLogsLabel = t("buttons.logs.copy");
  const confirmClearLabel = t("buttons.logs.confirmClear");
  const cancelClearLabel = t("buttons.logs.cancelClear");
  const logsCopiedLabel = t("messages.logsCopied");
  const logsCopyFailedLabel = t("messages.logsCopyFailed");
  const clearConfirmText = t("messages.logsClearConfirm");
  const noLogsLabel = t("messages.noLogs");

  function handleCloseWindow() {
    if (typeof onClose === "function") {
      onClose();
      return;
    }
    globalThis.close();
  }

  function toggleLevelFilter(level, checked) {
    setLevelFilters((current) => ({
      ...current,
      [level]: checked
    }));
  }

  function selectOnlyLevel(level) {
    setLevelFilters((current) => {
      const isAlreadyOnlyThis = LOG_LEVELS.every((item) => current[item] === (item === level));

      // Toggle solo mode: only this level <-> all levels enabled.
      if (isAlreadyOnlyThis) {
        const allEnabled = {};
        for (const item of LOG_LEVELS) {
          allEnabled[item] = true;
        }
        return allEnabled;
      }

      const onlyThis = {};
      for (const item of LOG_LEVELS) {
        onlyThis[item] = item === level;
      }
      return onlyThis;
    });
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const rawLevel = String(log.level || "info").toLowerCase();
      const normalizedLevel = rawLevel === "warn" ? "warning" : rawLevel;
      if (Object.prototype.hasOwnProperty.call(levelFilters, normalizedLevel)) {
        return Boolean(levelFilters[normalizedLevel]);
      }
      return Boolean(levelFilters.info);
    });
  }, [logs, levelFilters]);

  const orderedLogs = useMemo(() => {
    return [...filteredLogs].sort((left, right) => {
      const leftTime = new Date(left?.time || 0).getTime();
      const rightTime = new Date(right?.time || 0).getTime();
      return rightTime - leftTime;
    });
  }, [filteredLogs]);

  async function handleCopyLogs() {
    const text = orderedLogs.length ? orderedLogs.map((log) => serializeLogForClipboard(log)).join("\n\n") : "";

    try {
      if (globalThis.navigator?.clipboard?.writeText) {
        await globalThis.navigator.clipboard.writeText(text);
        onFeedback?.(logsCopiedLabel, false);
        return;
      }
    } catch (_error) {
      // Fallback below.
    }

    try {
      const textarea = globalThis.document?.createElement("textarea");
      if (!textarea) {
        onFeedback?.(logsCopyFailedLabel, true);
        return;
      }
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      globalThis.document.body.appendChild(textarea);
      textarea.select();
      const copied = globalThis.document.execCommand("copy");
      globalThis.document.body.removeChild(textarea);
      onFeedback?.(copied ? logsCopiedLabel : logsCopyFailedLabel, !copied);
    } catch (_error) {
      onFeedback?.(logsCopyFailedLabel, true);
    }
  }

  function handleOpenClearConfirm() {
    if (!orderedLogs.length) {
      if (isSadEasterEggActive) {
        onFeedback?.(noLogsLabel, false, FEEDBACK_QUICK_DURATION_MS);
        return;
      }
      onFeedback?.(noLogsLabel, false, FEEDBACK_QUICK_DURATION_MS);
      setEmptyStateShakeNonce((value) => value + 1);
      setEmptyClearClicks((value) => value + 1);
      return;
    }
    if (closeConfirmTimerRef.current) {
      globalThis.clearTimeout(closeConfirmTimerRef.current);
      closeConfirmTimerRef.current = null;
    }
    setIsConfirmClosing(false);
    setIsConfirmOpen(true);
  }

  function handleDismissClearConfirm() {
    if (!isConfirmOpen) {
      return;
    }
    setIsConfirmClosing(true);
    if (closeConfirmTimerRef.current) {
      globalThis.clearTimeout(closeConfirmTimerRef.current);
    }
    closeConfirmTimerRef.current = globalThis.setTimeout(() => {
      setIsConfirmOpen(false);
      setIsConfirmClosing(false);
      closeConfirmTimerRef.current = null;
    }, 170);
  }

  async function handleConfirmClearLogs() {
    if (typeof onClearLogs !== "function") {
      return;
    }

    try {
      await onClearLogs();
      handleDismissClearConfirm();
    } catch (_error) {
      handleDismissClearConfirm();
    }
  }

  useEffect(() => {
    if (isSadEasterEggActive || emptyClearClicks < 10) {
      return undefined;
    }

    setEmptyClearClicks(0);
    if (sadEasterEggTimerRef.current) {
      globalThis.clearTimeout(sadEasterEggTimerRef.current);
    }
    sadEasterEggTimerRef.current = globalThis.setTimeout(() => {
      setIsSadEasterEggActive(false);
      sadEasterEggTimerRef.current = null;
    }, SAD_EASTER_EGG_DURATION_MS);

    setIsSadEasterEggActive(true);
    return undefined;
  }, [emptyClearClicks, isSadEasterEggActive]);

  return (
    <LogsPanel>
      <LogsToolbar>
        <ToolbarTitle>{t("buttons.logs.title")}</ToolbarTitle>
        <ToolbarActions>
          <CopyLogsButton type="button" onClick={handleCopyLogs} title={copyLogsLabel} aria-label={copyLogsLabel}>
            <CopySymbolSvg size={13} />
          </CopyLogsButton>
          <FilterMenu ref={filterMenuRef}>
            <FilterToggleButton title={filtersLabel} aria-label={filtersLabel}>
              <FilterSymbolSvg size={16} />
            </FilterToggleButton>
            <FilterMenuPanel>
              {LOG_LEVELS.map((level) => (
                <FilterLabel key={level}>
                  <FilterCheckbox
                    type="checkbox"
                    checked={Boolean(levelFilters[level])}
                    onChange={(event) => toggleLevelFilter(level, event.currentTarget.checked)}
                  />
                  <FilterTextButton
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      selectOnlyLevel(level);
                    }}
                  >
                    {level.toUpperCase()}
                  </FilterTextButton>
                </FilterLabel>
              ))}
            </FilterMenuPanel>
          </FilterMenu>
          <ClearLogsButton
            type="button"
            onClick={handleOpenClearConfirm}
            title={clearLogsLabel}
            aria-label={clearLogsLabel}
          >
            <BanSymbolSvg size={12} />
          </ClearLogsButton>
          <OpenWindowButton
            type="button"
            onClick={handleOpenInNewWindow}
            title={openInWindowLabel}
            aria-label={openInWindowLabel}
          >
            <NewWindowSvg size={12} />
          </OpenWindowButton>
          <CloseWindowButton
            type="button"
            onClick={handleCloseWindow}
            title={closeWindowLabel}
            aria-label={closeWindowLabel}
          >
            <CrossSymbolSvg width={14} height={14} />
          </CloseWindowButton>
        </ToolbarActions>
      </LogsToolbar>
      <LogsContent>
        {orderedLogs.length
          ? orderedLogs.map((log, index) => <LogEntry key={`${log.time || index}-${index}`} log={log} t={t} />)
          : (
            <EmptyLogsState aria-label={t("messages.noLogs")} title={t("messages.noLogs")}>
              <EmptyLogsIllustration
                key={`empty-logs-illustration-${emptyStateShakeNonce}`}
                $shouldShake={emptyStateShakeNonce > 0}
              >
                {isSadEasterEggActive ? (
                  <EmptyLogsSadFaceMotion>
                    <SadFaceSvg size={56} color="currentColor" />
                  </EmptyLogsSadFaceMotion>
                ) : (
                  <LogsSvg size={40} color="currentColor" />
                )}
              </EmptyLogsIllustration>
            </EmptyLogsState>
          )}
      </LogsContent>

      {isConfirmOpen ? (
        <ConfirmOverlay
          role="dialog"
          aria-modal="true"
          aria-label={clearLogsLabel}
          $isClosing={isConfirmClosing}
          onClick={handleDismissClearConfirm}
        >
          <ConfirmCard onClick={(event) => event.stopPropagation()}>
            <ConfirmText>{clearConfirmText}</ConfirmText>
            <ConfirmDangerButton ref={confirmButtonRef} type="button" onClick={handleConfirmClearLogs}>
              {confirmClearLabel}
            </ConfirmDangerButton>
            <ConfirmDismissButton type="button" onClick={handleDismissClearConfirm}>
              {cancelClearLabel}
            </ConfirmDismissButton>
          </ConfirmCard>
        </ConfirmOverlay>
      ) : null}
    </LogsPanel>
  );
}
