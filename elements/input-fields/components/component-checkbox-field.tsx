import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/page-detail/component-input";

const ComponentCheckboxField: InputComponentType = ({ name, id }) => {
  const { t } = useTranslation("admin");
  const [field, meta] = useField(id);
  const errorText = meta.error && meta.touched ? meta.error : "";

  if (errorText) {
    return (
      <div className="is-invalid">
        <input
          type="checkbox"
          className={field.value ? "is-checked" : ""}
          id={name}
          {...field}
          value={field.value || ""}
        />
        <div className="error-message">{t(`${errorText}`)}</div>
      </div>
    );
  }

  return (
    <div>
      <input
        type="checkbox"
        className={field.value ? "is-checked" : ""}
        id={name}
        {...field}
        value={field.value || ""}
      />
    </div>
  );
};

export default ComponentCheckboxField;
