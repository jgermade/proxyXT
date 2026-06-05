import { h } from "preact";
import { FlagSvgDE } from "./icons/flags/FlagSvgDE.jsx";
import { FlagSvgES } from "./icons/flags/FlagSvgES.jsx";
import { FlagSvgFR } from "./icons/flags/FlagSvgFR.jsx";
import { FlagSvgIT } from "./icons/flags/FlagSvgIT.jsx";
import { FlagSvgPT } from "./icons/flags/FlagSvgPT.jsx";
import { FlagSvgUS } from "./icons/flags/FlagSvgUS.jsx";

export function LanguageFlag({ language, width = 18, height = 12 }) {
  const iconsByLanguage = {
    es: FlagSvgES,
    fr: FlagSvgFR,
    pt: FlagSvgPT,
    it: FlagSvgIT,
    de: FlagSvgDE
  };

  const FlagIcon = iconsByLanguage[language] || FlagSvgUS;
  return <FlagIcon width={width} height={height} />;
}
