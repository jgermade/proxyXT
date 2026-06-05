import { h, render } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import { sendMessage } from "./lib/runtime.js";
import { createTranslator, resolveLanguage } from "./lib/i18n.js";
import { LogsView } from "./views/logs/LogsView.jsx";

function LogsWindowApp() {
  const [logs, setLogs] = useState([]);
  const [languagePreference, setLanguagePreference] = useState("auto");

  const effectiveLanguage = resolveLanguage(languagePreference, globalThis.navigator?.language);
  const t = useMemo(() => createTranslator(effectiveLanguage), [effectiveLanguage]);

  async function callBackground(type, payload = {}) {
    const response = await sendMessage({ type, payload });
    if (!response?.ok) {
      throw new Error(response?.error || "Unknown error");
    }
    return response;
  }

  async function refreshStateAndLogs() {
    const stateResponse = await callBackground("proxyxt/getState");
    const preference = stateResponse?.state?.preferences?.language || "auto";
    setLanguagePreference(preference);

    const logsResponse = await callBackground("proxyxt/getLogs");
    setLogs(Array.isArray(logsResponse.logs) ? logsResponse.logs : []);
  }

  useEffect(() => {
    let isMounted = true;

    const safeRefresh = async () => {
      try {
        await refreshStateAndLogs();
      } catch (_error) {
        if (isMounted) {
          setLogs([]);
        }
      }
    };

    safeRefresh();

    const intervalId = globalThis.setInterval(safeRefresh, 3000);
    const onFocus = () => {
      safeRefresh();
    };
    globalThis.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      globalThis.clearInterval(intervalId);
      globalThis.removeEventListener("focus", onFocus);
    };
  }, []);

  return <LogsView t={t} logs={logs} />;
}

render(h(LogsWindowApp, null), document.getElementById("logsRoot"));
