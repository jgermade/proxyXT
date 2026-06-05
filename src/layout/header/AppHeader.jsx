import { h } from "preact";
import { SquaredButton } from "../../components/SquaredButton.jsx";
import { PreferencesSvg } from "../../components/icons/PreferencesSvg.jsx";
import { AppLogo } from "./AppLogo.jsx";
import { HeaderBrand, HeaderText } from "./HeaderBrand.jsx";
import { AppTitle } from "./AppTitle.jsx";
import { HeaderActions } from "./HeaderActions.jsx";
import { HeaderHome } from "./HeaderHome.jsx";
import { HeaderSubtitle } from "./HeaderSubtitle.jsx";
import { StyledAppHeader } from "./AppHeader.styles.jsx";

export function AppHeader({
  t,
  subtitle,
  view,
  handleOpenList,
  handleTogglePreferences,
  handlePrimaryAction
}) {
  return (
    <StyledAppHeader>
      <HeaderHome
        role="button"
        tabIndex={0}
        onClick={handleOpenList}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenList();
          }
        }}
      >
        <HeaderBrand>
          <AppLogo />
          <HeaderText>
            <AppTitle>{t("app.title")}</AppTitle>
            <HeaderSubtitle id="headerSubtitle">{subtitle}</HeaderSubtitle>
          </HeaderText>
        </HeaderBrand>
      </HeaderHome>
      <HeaderActions>
        <SquaredButton
          variant="icon"
          slot="header"
          active={view === "preferences"}
          ariaLabel={view === "preferences" ? t("buttons.preferences.hide") : t("buttons.preferences.show")}
          title={t("preferences.title")}
          onClick={handleTogglePreferences}
        >
          <PreferencesSvg />
        </SquaredButton>

        <SquaredButton
          variant="plusToggle"
          view={view === "form" ? "form" : "list"}
          onClick={handlePrimaryAction}
          ariaLabel={view === "form" ? t("buttons.server.backToList") : t("buttons.server.add")}
        />
      </HeaderActions>
    </StyledAppHeader>
  );
}