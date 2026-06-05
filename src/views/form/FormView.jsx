import { h } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { ColorField } from "../../components/form/ColorField.jsx";
import { ColorPickerSvg } from "../../components/icons/ColorPickerSvg.jsx";
import { InputField } from "../../components/form/InputField.jsx";
import { SelectField } from "../../components/form/SelectField.jsx";
import {
  Actions,
  DeleteButton,
  ColorPresetRow,
  ColorPresetButton,
  ColorPresetPanel,
  ColorPresetSwatch,
  FormPanel,
  FormRow,
  HiddenColorInput,
  HostColorRow,
  ProxyForm,
  UserColorButton,
  UserColorPickerIcon,
  SubmitButton
} from "./FormView.styles.jsx";

const COLOR_PRESETS = [
  "#ff5400",
  "#0053ff",
  "#00a676",
  "#e63946",
  "#9b5de5",
  "#f4a261",
  "#2a9d8f",
  "#ff006e",
  "#8338ec",
  "#3a86ff",
  "#06d6a0",
  "#ef476f"
];

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
  const hostColorRowRef = useRef(null);
  const customColorInputRefs = useRef([]);
  const addCustomColorInputRef = useRef(null);
  const customColors = Array.isArray(userColorPresets) ? userColorPresets : [];

  useEffect(() => {
    if (!showColorPresets) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (!hostColorRowRef.current?.contains(event.target)) {
        setShowColorPresets(false);
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
    }
  }, [view]);

  function handleToggleColorPresets() {
    setShowColorPresets((current) => !current);
  }

  function handleSelectColor(color) {
    setFormData((current) => ({ ...current, selectionColor: color }));
    setShowColorPresets(false);
  }

  function handleOpenUserColorPicker(index) {
    customColorInputRefs.current[index]?.click();
  }

  function handleCustomColorInput(index, color) {
    const normalized = String(color || "").trim().toUpperCase();
    if (!normalized) {
      return;
    }

    let nextColors;
    if (index < 0) {
      nextColors = customColors.includes(normalized) ? customColors : [...customColors, normalized];
    } else {
      nextColors = customColors.slice();
      nextColors[index] = normalized;
    }

    onUpdateUserColorPresets?.(nextColors);
    setFormData((current) => ({ ...current, selectionColor: normalized }));
  }

  function handleOpenAddColorPicker() {
    addCustomColorInputRef.current?.click();
  }

  return (
    <FormPanel $isVisible={view === "form"}>
      <ProxyForm onSubmit={onSubmit}>
        <FormRow>
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
            type="number"
            value={formData.port}
            min={1}
            max={65535}
            required={true}
            onInput={(value) => setFormData((current) => ({ ...current, port: value }))}
          />
        </FormRow>

        <HostColorRow ref={hostColorRowRef}>
          <ColorField
            label={t("labels.selectionColor")}
            id="selectionColor"
            value={formData.selectionColor}
            onClick={handleToggleColorPresets}
          />

          {showColorPresets ? (
            <ColorPresetPanel>
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

              <ColorPresetRow>
                {customColors.map((customColor, index) => {
                  return (
                    <UserColorButton
                      key={`custom-${customColor}-${index}`}
                      type="button"
                      aria-label={customColor.toUpperCase()}
                      title={customColor.toUpperCase()}
                      onClick={() => handleOpenUserColorPicker(index)}
                    >
                      <ColorPresetSwatch $value={customColor} aria-hidden="true" />
                      <UserColorPickerIcon>
                        <ColorPickerSvg size={11} color="currentColor" />
                      </UserColorPickerIcon>
                      <HiddenColorInput
                        ref={(element) => {
                          customColorInputRefs.current[index] = element;
                        }}
                        type="color"
                        value={customColor}
                        onInput={(event) => handleCustomColorInput(index, event.currentTarget.value)}
                      />
                    </UserColorButton>
                  );
                })}

                <UserColorButton
                  type="button"
                  aria-label={t("labels.selectionColor")}
                  title={t("labels.selectionColor")}
                  onClick={handleOpenAddColorPicker}
                >
                  <ColorPresetSwatch $value={null} aria-hidden="true" />
                  <UserColorPickerIcon>
                    <ColorPickerSvg size={11} color="currentColor" />
                  </UserColorPickerIcon>
                  <HiddenColorInput
                    ref={addCustomColorInputRef}
                    type="color"
                    value={formData.selectionColor}
                    onInput={(event) => handleCustomColorInput(-1, event.currentTarget.value)}
                  />
                </UserColorButton>
              </ColorPresetRow>
            </ColorPresetPanel>
          ) : (
            <InputField
              label={t("labels.host")}
              id="host"
              type="text"
              value={formData.host}
              required={true}
              onInput={(value) => setFormData((current) => ({ ...current, host: value }))}
            />
          )}
        </HostColorRow>

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
