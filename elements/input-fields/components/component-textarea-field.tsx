import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/page-detail/component-input";

const ComponentTextareaField: InputComponentType = ({ name, id }) => {
  const { t } = useTranslation("admin");
  const [field, meta] = useField(id);
  const errorText = meta.error && meta.touched ? meta.error : "";

  if (errorText) {
    return (
      <div className="is-invalid">
        <textarea
          placeholder={name}
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
      <textarea
        placeholder={name}
        id={name}
        {...field}
        value={field.value || ""}
      />
    </div>
  );
};

export default ComponentTextareaField;
