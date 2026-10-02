import { createTranslator, resolveLanguage } from "./i18n.js";

export function getBackgroundTranslator(state) {
  const api = globalThis.browser ?? globalThis.chrome;
  const preference = state?.preferences?.language || "auto";
  const uiLanguage = api?.i18n?.getUILanguage?.() || "en";
  const language = resolveLanguage(preference, uiLanguage);
  return createTranslator(language);
}

export function getNotificationMessage(state, key, replacements = {}) {
  const t = getBackgroundTranslator(state);
  return t(`background.notifications.${key}`, replacements);
}

export function getLogMessage(state, key, { fallback = key, replacements = {} } = {}) {
  const t = getBackgroundTranslator(state);
  const path = `background.logs.${key}`;
  const message = t(path, replacements);
  return message === path ? (fallback || "") : message;
}