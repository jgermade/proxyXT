import { h } from "preact";
import { InputField } from "../../components/form/InputField.jsx";
import { SelectField } from "../../components/form/SelectField.jsx";

export function FormView({
  t,
  view,
  formMode,
  formData,
  setFormData,
  onSubmit,
  onDelete
}) {
  return (
    <section className={`view-panel${view === "form" ? "" : " hidden"}`}>
      <form className="proxy-form" onSubmit={onSubmit}>
        <div className="row">
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
        </div>

        <InputField
          label={t("labels.host")}
          id="host"
          type="text"
          value={formData.host}
          required={true}
          onInput={(value) => setFormData((current) => ({ ...current, host: value }))}
        />

        <InputField
          label={t("labels.bypassList")}
          id="bypassList"
          type="text"
          value={formData.bypassList}
          placeholder={t("placeholders.bypassList")}
          onInput={(value) => setFormData((current) => ({ ...current, bypassList: value }))}
        />

        <InputField
          label={t("labels.alias")}
          id="name"
          type="text"
          value={formData.name}
          maxLength={80}
          onInput={(value) => setFormData((current) => ({ ...current, name: value }))}
        />

        <div className="actions">
          <button type="submit">{formMode === "edit" ? t("buttons.server.saveChanges") : t("buttons.server.save")}</button>
          <button
            id="deleteServer"
            type="button"
            className={`ghost${formData.id ? "" : " hidden"}`}
            onClick={onDelete}
          >
            {t("buttons.server.delete")}
          </button>
        </div>
      </form>
    </section>
  );
}
