import { Fragment, h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ColorField } from "../../components/form/ColorField.jsx";
import { BanSymbolSvg } from "../../components/icons/BanSymbolSvg.jsx";
import { ColorPickerSvg } from "../../components/icons/ColorPickerSvg.jsx";
import { OkCheckSvg } from "../../components/icons/OkCheckSvg.jsx";
import { InputField } from "../../components/form/InputField.jsx";
import { SelectField } from "../../components/form/SelectField.jsx";
import { getContrastingTextColor } from "../../lib/colors.js";
import {
  Actions,
  DeleteButton,
  ColorPresetRow,
  CustomColorPickerCloseButton,
  CustomColorPickerHeader,
  CustomColorInputGroup,
  CustomColorInput,
  CustomColorInputs,
  CustomColorPickerActionButton,
  CustomColorPickerActions,
  CustomColorPickerMain,
  CustomColorPickerPanel,
  CustomColorPickerPreview,
  CustomColorPickerPreviewSwatch,
  CustomColorHueScale,
  CustomColorHueSlider,
  CustomColorSpectrum,
  CustomColorSpectrumThumb,
  UserColorActions,
  UserColorAddIcon,
  UserColorList,
  UserColorRow,
  ColorPresetButton,
  ColorPresetPanel,
  ColorPresetSwatch,
  FormPanel,
  FormRow,
  ProxyForm,
  UserColorBanIcon,
  UserColorButton,
  UserColorDeleteToggleIcon,
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

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function componentToHex(value) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0").toUpperCase();
}

function rgbToHex(red, green, blue) {
  return `#${componentToHex(red)}${componentToHex(green)}${componentToHex(blue)}`;
}

function parseHexColor(hex) {
  const normalized = String(hex || "").trim().replace(/^#/, "");
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return null;
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16)
  };
}

function rgbToHsv(red, green, blue) {
  const r = clamp(red, 0, 255) / 255;
  const g = clamp(green, 0, 255) / 255;
  const b = clamp(blue, 0, 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) {
      hue = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      hue = 60 * ((b - r) / delta + 2);
    } else {
      hue = 60 * ((r - g) / delta + 4);
    }
  }

  return {
    h: hue < 0 ? hue + 360 : hue,
    s: max === 0 ? 0 : (delta / max) * 100,
    v: max * 100
  };
}

function hsvToRgb(hue, saturation, value) {
  const h = ((hue % 360) + 360) % 360;
  const s = clamp(saturation, 0, 100) / 100;
  const v = clamp(value, 0, 100) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (h < 60) {
    rPrime = c;
    gPrime = x;
  } else if (h < 120) {
    rPrime = x;
    gPrime = c;
  } else if (h < 180) {
    gPrime = c;
    bPrime = x;
  } else if (h < 240) {
    gPrime = x;
    bPrime = c;
  } else if (h < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255)
  };
}

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
  const [isCustomColorPickerOpen, setIsCustomColorPickerOpen] = useState(false);
  const [pickerHue, setPickerHue] = useState(210);
  const [pickerSaturation, setPickerSaturation] = useState(100);
  const [pickerValue, setPickerValue] = useState(100);
  const [pickerHexInput, setPickerHexInput] = useState("");
  const hostColorRowRef = useRef(null);
  const customColorPickerPanelRef = useRef(null);
  const customColorSpectrumRef = useRef(null);
  const initialPickerColorRef = useRef(formData.selectionColor);
  const wasFormVisibleRef = useRef(view === "form");
  const hostInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const bypassListInputRef = useRef(null);
  const portInputRef = useRef(null);
  const customColors = Array.isArray(userColorPresets) ? userColorPresets : [];
  const displayedCustomColors = customColors.slice(0, MAX_USER_COLORS);
  const isScreenColorPickSupported =
    typeof globalThis !== "undefined" && typeof globalThis.EyeDropper === "function";

  useEffect(() => {
    if (!showColorPresets) {
      return undefined;
    }

    function handlePointerDown(event) {
      const clickedInsideHostColorRow = hostColorRowRef.current?.contains(event.target);
      const clickedInsideCustomPicker = customColorPickerPanelRef.current?.contains(event.target);
      if (!clickedInsideHostColorRow && !clickedInsideCustomPicker) {
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
      setIsCustomColorPickerOpen(false);
    }
  }, [view]);

  useEffect(() => {
    if (!showColorPresets) {
      setIsCustomColorPickerOpen(false);
    }
  }, [showColorPresets]);

  useEffect(() => {
    if (!isCustomColorPickerOpen) {
      return;
    }

    const parsed = parseHexColor(formData.selectionColor);
    if (!parsed) {
      return;
    }

    const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
    setPickerHue(hsv.h);
    setPickerSaturation(hsv.s);
    setPickerValue(hsv.v);
    setPickerHexInput(rgbToHex(parsed.r, parsed.g, parsed.b));
  }, [isCustomColorPickerOpen, formData.selectionColor]);

  useEffect(() => {
    const isFormVisible = view === "form";
    const didJustOpenForm = isFormVisible && !wasFormVisibleRef.current;
    wasFormVisibleRef.current = isFormVisible;

    if (!didJustOpenForm || showColorPresets || isCustomColorPickerOpen) {
      return undefined;
    }

    const focusTimer = globalThis.setTimeout(() => {
      const preferredInput =
        formMode === "edit"
          ? [
              { ref: portInputRef, value: formData.port },
              { ref: hostInputRef, value: formData.host },
              { ref: nameInputRef, value: formData.name },
              { ref: bypassListInputRef, value: formData.bypassList }
            ].find((field) => !String(field.value || "").trim())?.ref
          : null;
      const inputToFocus = preferredInput?.current || portInputRef.current;

      if (!inputToFocus) {
        return;
      }
      inputToFocus.focus();
      inputToFocus.select?.();
    }, 0);

    return () => {
      globalThis.clearTimeout(focusTimer);
    };
  }, [
    view,
    showColorPresets,
    isCustomColorPickerOpen,
    formMode
  ]);

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

  function handleToggleDeleteMode() {
    setIsDeleteModeEnabled((current) => !current);
  }

  function handleOpenAddColorPicker() {
    setIsCustomColorPickerOpen((current) => {
      const next = !current;
      if (next) {
        initialPickerColorRef.current = formData.selectionColor;
        setShowColorPresets(true);
        setIsDeleteModeEnabled(false);
      }
      return next;
    });
  }

  function applyPickerColor(nextHue, nextSaturation, nextValue) {
    const rgb = hsvToRgb(nextHue, nextSaturation, nextValue);
    const nextHex = rgbToHex(rgb.r, rgb.g, rgb.b);
    setPickerHue(nextHue);
    setPickerSaturation(nextSaturation);
    setPickerValue(nextValue);
    setPickerHexInput(nextHex);
    setFormData((current) => ({ ...current, selectionColor: nextHex }));
  }

  function handleSpectrumPointer(event) {
    const spectrum = customColorSpectrumRef.current;
    if (!spectrum) {
      return;
    }

    const rect = spectrum.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, rect.width);
    const y = clamp(event.clientY - rect.top, 0, rect.height);
    const nextSaturation = rect.width ? (x / rect.width) * 100 : 0;
    const nextValue = rect.height ? 100 - (y / rect.height) * 100 : 0;
    applyPickerColor(pickerHue, nextSaturation, nextValue);
  }

  function handleHexInputBlur() {
    const parsed = parseHexColor(pickerHexInput);
    if (!parsed) {
      const rgb = hsvToRgb(pickerHue, pickerSaturation, pickerValue);
      setPickerHexInput(rgbToHex(rgb.r, rgb.g, rgb.b));
      return;
    }

    const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
    applyPickerColor(hsv.h, hsv.s, hsv.v);
  }

  function handleRgbInputChange(channel, value) {
    const parsedValue = Number.parseInt(String(value || "").trim(), 10);
    const clamped = Number.isNaN(parsedValue) ? 0 : clamp(parsedValue, 0, 255);
    const currentRgb = hsvToRgb(pickerHue, pickerSaturation, pickerValue);
    const nextRgb = {
      ...currentRgb,
      [channel]: clamped
    };
    const hsv = rgbToHsv(nextRgb.r, nextRgb.g, nextRgb.b);
    applyPickerColor(hsv.h, hsv.s, hsv.v);
  }

  function handleConfirmCustomColorPicker() {
    const currentHex = rgbToHex(...Object.values(hsvToRgb(pickerHue, pickerSaturation, pickerValue)));
    handleCustomColorInput(-1, currentHex);
    setIsCustomColorPickerOpen(false);
  }

  function handleDismissCustomColorPicker() {
    const initialColor = initialPickerColorRef.current;
    if (initialColor) {
      setFormData((current) => ({ ...current, selectionColor: initialColor }));
    }
    setIsCustomColorPickerOpen(false);
  }

  async function handlePickColorFromScreen() {
    if (!isScreenColorPickSupported) {
      return;
    }

    try {
      const eyeDropper = new globalThis.EyeDropper();
      const result = await eyeDropper.open();
      const parsed = parseHexColor(result?.sRGBHex);
      if (!parsed) {
        return;
      }
      const hsv = rgbToHsv(parsed.r, parsed.g, parsed.b);
      applyPickerColor(hsv.h, hsv.s, hsv.v);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }
    }
  }

  return (
    <FormPanel $isVisible={view === "form"}>
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
                            handleSelectColor(customColor);
                          }}
                        >
                          <ColorPresetSwatch $value={customColor} aria-hidden="true" />
                          <UserColorBanIcon
                            $iconColor={iconContrastColor}
                            style={{ opacity: isDeleteModeEnabled ? undefined : 0 }}
                          >
                            <BanSymbolSvg size={10} color="currentColor" />
                          </UserColorBanIcon>
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
                placeholder={t("placeholders.port")}
                min={1}
                max={65535}
                required={true}
                onInput={(value) => setFormData((current) => ({ ...current, port: value }))}
              />
            </>
          )}
        </FormRow>

        {isCustomColorPickerOpen ? (
          <CustomColorPickerPanel ref={customColorPickerPanelRef}>
            <CustomColorPickerHeader>
              <CustomColorPickerPreview>
                <CustomColorPickerPreviewSwatch $value={formData.selectionColor} aria-hidden="true" />
                <span>{String(formData.selectionColor || "").toUpperCase()}</span>
              </CustomColorPickerPreview>

              <CustomColorPickerActions>
                {isScreenColorPickSupported ? (
                  <CustomColorPickerActionButton
                    type="button"
                    aria-label="Pick color from screen"
                    title="Pick color from screen"
                    onClick={handlePickColorFromScreen}
                  >
                    <ColorPickerSvg size={12} color="currentColor" />
                  </CustomColorPickerActionButton>
                ) : null}

                <CustomColorPickerCloseButton
                  type="button"
                  aria-label={t("buttons.dismiss")}
                  title={t("buttons.dismiss")}
                  onClick={handleDismissCustomColorPicker}
                >
                  <BanSymbolSvg size={12} color="currentColor" />
                </CustomColorPickerCloseButton>

                <CustomColorPickerActionButton
                  type="button"
                  aria-label={t("buttons.server.save")}
                  title={t("buttons.server.save")}
                  onClick={handleConfirmCustomColorPicker}
                >
                  <OkCheckSvg size={11} color="currentColor" />
                </CustomColorPickerActionButton>
              </CustomColorPickerActions>
            </CustomColorPickerHeader>

            <CustomColorPickerMain>
              <CustomColorSpectrum
                ref={customColorSpectrumRef}
                $hue={pickerHue}
                onPointerDown={(event) => {
                  event.preventDefault();
                  handleSpectrumPointer(event);
                }}
                onPointerMove={(event) => {
                  if (event.buttons !== 1) {
                    return;
                  }
                  handleSpectrumPointer(event);
                }}
              >
                <CustomColorSpectrumThumb
                  $saturation={pickerSaturation}
                  $value={pickerValue}
                />
              </CustomColorSpectrum>

              <CustomColorHueSlider
                type="range"
                min={0}
                max={360}
                value={Math.round(pickerHue)}
                onInput={(event) => {
                  const nextHue = Number.parseInt(event.currentTarget.value, 10) || 0;
                  applyPickerColor(nextHue, pickerSaturation, pickerValue);
                }}
              />

              <CustomColorHueScale aria-hidden="true" />
            </CustomColorPickerMain>

            <CustomColorInputs>
              <CustomColorInputGroup>
                <span>HEX</span>
                <CustomColorInput
                  type="text"
                  value={pickerHexInput}
                  maxLength={7}
                  onInput={(event) => {
                    const rawValue = String(event.currentTarget.value || "").toUpperCase();
                    const normalized = rawValue.startsWith("#") ? rawValue : `#${rawValue.replace(/^#+/, "")}`;
                    setPickerHexInput(normalized.slice(0, 7));
                  }}
                  onBlur={handleHexInputBlur}
                />
              </CustomColorInputGroup>

              <CustomColorInputGroup>
                <span>R</span>
                <CustomColorInput
                  type="number"
                  min={0}
                  max={255}
                  value={hsvToRgb(pickerHue, pickerSaturation, pickerValue).r}
                  onInput={(event) => handleRgbInputChange("r", event.currentTarget.value)}
                />
              </CustomColorInputGroup>

              <CustomColorInputGroup>
                <span>G</span>
                <CustomColorInput
                  type="number"
                  min={0}
                  max={255}
                  value={hsvToRgb(pickerHue, pickerSaturation, pickerValue).g}
                  onInput={(event) => handleRgbInputChange("g", event.currentTarget.value)}
                />
              </CustomColorInputGroup>

              <CustomColorInputGroup>
                <span>B</span>
                <CustomColorInput
                  type="number"
                  min={0}
                  max={255}
                  value={hsvToRgb(pickerHue, pickerSaturation, pickerValue).b}
                  onInput={(event) => handleRgbInputChange("b", event.currentTarget.value)}
                />
              </CustomColorInputGroup>
            </CustomColorInputs>
          </CustomColorPickerPanel>
        ) : (
          <>
            <InputField
              label={t("labels.host")}
              id="host"
              inputRef={hostInputRef}
              type="text"
              value={formData.host}
              placeholder={t("placeholders.host")}
              required={true}
              onInput={(value) => setFormData((current) => ({ ...current, host: value }))}
            />

            <InputField
              label={t("labels.alias")}
              id="name"
              inputRef={nameInputRef}
              type="text"
              value={formData.name}
              maxLength={80}
              onInput={(value) => setFormData((current) => ({ ...current, name: value }))}
            />

            <InputField
              label={t("labels.bypassList")}
              id="bypassList"
              inputRef={bypassListInputRef}
              type="text"
              value={formData.bypassList}
              placeholder={t("placeholders.bypassList")}
              onInput={(value) => setFormData((current) => ({ ...current, bypassList: value }))}
            />
          </>
        )}

        <Actions>
          <SubmitButton type="submit">{formMode === "edit" ? t("buttons.server.save") : t("buttons.server.add")}</SubmitButton>
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
