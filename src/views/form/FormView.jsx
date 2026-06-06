import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ColorField } from "../../components/form/ColorField.jsx";
import { BanSymbolSvg } from "../../components/icons/BanSymbolSvg.jsx";
import { ColorPickerSvg } from "../../components/icons/ColorPickerSvg.jsx";
import { InputField } from "../../components/form/InputField.jsx";
import { SelectField } from "../../components/form/SelectField.jsx";
import { getContrastingTextColor } from "../../lib/colors.js";
import {
  Actions,
  DeleteButton,
  ColorPresetRow,
  UserColorActions,
  UserColorAddIcon,
  UserColorList,
  UserColorRow,
  ColorPresetButton,
  ColorPresetPanel,
  ColorPresetSwatch,
  FormPanel,
  FormRow,
  HiddenColorInput,
  NativeColorPickerOverlay,
  ProxyForm,
  UserColorBanIcon,
  UserColorButton,
  UserColorDeleteToggleIcon,
  UserColorPickerIcon,
  SubmitButton
} from "./FormView.styles.jsx";

const COLOR_PRESETS = [
  "#e63946",
  "#ef476f",
  "#ff006e",
  "#ff5400",
  "#f4a261",
  "#06d6a0",
  "#00a676",
  "#2a9d8f",
  "#3a86ff",
  "#0053ff",
  "#8338ec",
  "#9b5de5"
];

const MAX_USER_COLORS = Math.max(1, COLOR_PRESETS.length - 1);

export function FormView({
  t,
  view,
  formMode,
  formData,
  setFormData,
  userColorPresets,
  onUpdateUserColorPresets,
  onSubmit,
  onDelete
}) {
  const [showColorPresets, setShowColorPresets] = useState(false);
  const [isDeleteModeEnabled, setIsDeleteModeEnabled] = useState(false);
  const [isNativeColorPickerOpen, setIsNativeColorPickerOpen] = useState(false);
  const hostColorRowRef = useRef(null);
  const customColorInputRefs = useRef([]);
  const addCustomColorInputRef = useRef(null);
  const activeNativeColorInputRef = useRef(null);
  const portInputRef = useRef(null);
  const customColors = Array.isArray(userColorPresets) ? userColorPresets : [];
  const displayedCustomColors = customColors.slice(0, MAX_USER_COLORS);

  useEffect(() => {
    if (!showColorPresets) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!hostColorRowRef.current?.contains(event.target)) {
        setShowColorPresets(false);
        setIsDeleteModeEnabled(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [showColorPresets]);

  useEffect(() => {
    if (view !== "form") {
      setShowColorPresets(false);
      setIsDeleteModeEnabled(false);
      setIsNativeColorPickerOpen(false);
      activeNativeColorInputRef.current = null;
    }
  }, [view]);

  useEffect(() => {
    if (view !== "form" || showColorPresets) {
      return undefined;
    }

    const focusTimer = globalThis.setTimeout(() => {
      if (!portInputRef.current) {
        return;
      }
      portInputRef.current.focus();
      portInputRef.current.select?.();
    }, 0);

    return () => {
      globalThis.clearTimeout(focusTimer);
    };
  }, [view, showColorPresets, formMode]);

  function handleToggleColorPresets() {
    setShowColorPresets((current) => {
      const next = !current;
      if (!next) {
        setIsDeleteModeEnabled(false);
      }
      return next;
    });
  }

  function handleSelectColor(color) {
    setFormData((current) => ({ ...current, selectionColor: color }));
    setShowColorPresets(false);
  }

  function openNativeColorPicker(inputElement) {
    if (!inputElement) {
      return;
    }

    activeNativeColorInputRef.current = inputElement;
    setIsNativeColorPickerOpen(true);
    inputElement.click();
  }

  function handleOpenUserColorPicker(index) {
    openNativeColorPicker(customColorInputRefs.current[index]);
  }

  function handleCustomColorInput(index, color) {
    const normalized = String(color || "").trim().toUpperCase();
    if (!normalized) {
      return;
    }

    let nextColors;
    if (index < 0) {
      nextColors = customColors.includes(normalized) ? customColors : [...customColors, normalized].slice(0, MAX_USER_COLORS);
    } else {
      nextColors = customColors.slice();
      nextColors[index] = normalized;
    }

    onUpdateUserColorPresets?.(nextColors);
    setFormData((current) => ({ ...current, selectionColor: normalized }));
  }

  function handleDeleteCustomColor(index) {
    const nextColors = customColors.filter((_, colorIndex) => colorIndex !== index);
    onUpdateUserColorPresets?.(nextColors);
  }

  function closeNativeColorPicker(inputElement = activeNativeColorInputRef.current) {
    if (inputElement && typeof inputElement.blur === "function") {
      inputElement.blur();
    }

    setIsNativeColorPickerOpen(false);
    activeNativeColorInputRef.current = null;
  }

  function handleToggleDeleteMode() {
    setIsDeleteModeEnabled((current) => !current);
  }

  function handleOpenAddColorPicker() {
    openNativeColorPicker(addCustomColorInputRef.current);
  }

  return (
    <FormPanel $isVisible={view === "form"}>
      {isNativeColorPickerOpen ? (
        <NativeColorPickerOverlay
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            closeNativeColorPicker();
          }}
          onTouchStart={(event) => {
            event.preventDefault();
            event.stopPropagation();
            closeNativeColorPicker();
          }}
        />
      ) : null}

      <ProxyForm onSubmit={onSubmit}>
        <FormRow ref={hostColorRowRef}>
          <ColorField
            label={t("labels.selectionColor")}
            id="selectionColor"
            value={formData.selectionColor}
            onClick={handleToggleColorPresets}
          />

          {showColorPresets ? (
            <ColorPresetPanel style={{ gridColumn: "2 / span 2" }}>
              <ColorPresetRow>
                {COLOR_PRESETS.map((color) => (
                  <ColorPresetButton
                    key={color}
                    type="button"
                    title={color.toUpperCase()}
                    aria-label={color.toUpperCase()}
                    onClick={() => handleSelectColor(color)}
                  >
                    <ColorPresetSwatch $value={color} aria-hidden="true" />
                  </ColorPresetButton>
                ))}
              </ColorPresetRow>

              <ColorPresetRow $isUserRow>
                <UserColorRow>
                  <UserColorList>
                    {displayedCustomColors.map((customColor, index) => {
                      const iconContrastColor = getContrastingTextColor(customColor);

                      return (
                        <UserColorButton
                          key={`custom-${customColor}-${index}`}
                          type="button"
                          aria-label={customColor.toUpperCase()}
                          title={customColor.toUpperCase()}
                          $deleteMode={isDeleteModeEnabled}
                          onClick={() => {
                            if (isDeleteModeEnabled) {
                              handleDeleteCustomColor(index);
                              return;
                            }
                            // handleOpenUserColorPicker(index);
                            handleSelectColor(customColor)
                          }}
                        >
                          <ColorPresetSwatch $value={customColor} aria-hidden="true" />
                          {/* <UserColorPickerIcon
                            $iconColor={iconContrastColor}
                            style={{ opacity: isDeleteModeEnabled ? 0 : undefined }}
                          >
                            <ColorPickerSvg size={11} color="currentColor" />
                          </UserColorPickerIcon> */}
                          <UserColorBanIcon
                            $iconColor={iconContrastColor}
                            style={{ opacity: isDeleteModeEnabled ? undefined : 0 }}
                          >
                            <BanSymbolSvg size={10} color="currentColor" />
                          </UserColorBanIcon>
                          <HiddenColorInput
                            ref={(element) => {
                              customColorInputRefs.current[index] = element;
                            }}
                            type="color"
                            value={customColor}
                            onBlur={() => {
                              closeNativeColorPicker();
                            }}
                            onChange={(event) => {
                              handleCustomColorInput(index, event.currentTarget.value);
                            }}
                          />
                        </UserColorButton>
                      );
                    })}
                  </UserColorList>

                  <UserColorActions>
                    <UserColorButton
                      type="button"
                      aria-label={t("labels.selectionColor")}
                      title={t("labels.selectionColor")}
                      onClick={handleOpenAddColorPicker}
                    >
                      <ColorPresetSwatch $value={null} aria-hidden="true" />
                      <UserColorAddIcon>
                        <ColorPickerSvg size={11} color="currentColor" />
                      </UserColorAddIcon>
                      <HiddenColorInput
                        ref={addCustomColorInputRef}
                        type="color"
                        value={formData.selectionColor}
                        onBlur={() => {
                          closeNativeColorPicker();
                        }}
                        onChange={(event) => {
                          handleCustomColorInput(-1, event.currentTarget.value);
                        }}
                      />
                    </UserColorButton>

                    {displayedCustomColors.length > 0 ? (
                      <UserColorButton
                        type="button"
                        aria-label={t("labels.selectionColor")}
                        title={t("buttons.server.delete")}
                        $isDeleteToggle
                        $deleteMode={isDeleteModeEnabled}
                        onClick={handleToggleDeleteMode}
                      >
                        <ColorPresetSwatch $value={null} aria-hidden="true" />
                        <UserColorDeleteToggleIcon>
                          <BanSymbolSvg size={10} color="currentColor" />
                        </UserColorDeleteToggleIcon>
                      </UserColorButton>
                    ) : null}
                  </UserColorActions>
                </UserColorRow>
              </ColorPresetRow>
            </ColorPresetPanel>
          ) : (
            <>
              <SelectField
                label={t("labels.scheme")}
                id="scheme"
                value={formData.scheme}
                onChange={(value) => setFormData((current) => ({ ...current, scheme: value }))}
                options={[
                  { value: "http", label: "http" },
                  { value: "https", label: "https" },
                  { value: "socks4", label: "socks4" },
                  { value: "socks5", label: "socks5" }
                ]}
              />
              <InputField
                label={t("labels.port")}
                id="port"
                inputRef={portInputRef}
                type="number"
                value={formData.port}
                min={1}
                max={65535}
                required={true}
                onInput={(value) => setFormData((current) => ({ ...current, port: value }))}
              />
            </>
          )}
        </FormRow>

        <InputField
          label={t("labels.host")}
          id="host"
          type="text"
          value={formData.host}
          required={true}
          onInput={(value) => setFormData((current) => ({ ...current, host: value }))}
        />

        <InputField
          label={t("labels.alias")}
          id="name"
          type="text"
          value={formData.name}
          maxLength={80}
          onInput={(value) => setFormData((current) => ({ ...current, name: value }))}
        />

        <InputField
          label={t("labels.bypassList")}
          id="bypassList"
          type="text"
          value={formData.bypassList}
          placeholder={t("placeholders.bypassList")}
          onInput={(value) => setFormData((current) => ({ ...current, bypassList: value }))}
        />

        <Actions>
          <SubmitButton type="submit">{formMode === "edit" ? t("buttons.server.saveChanges") : t("buttons.server.save")}</SubmitButton>
          <DeleteButton
            type="button"
            $isVisible={Boolean(formData.id)}
            onClick={onDelete}
          >
            {t("buttons.server.delete")}
          </DeleteButton>
        </Actions>
      </ProxyForm>
    </FormPanel>
  );
}
