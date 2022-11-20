import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/pageDetail/ComponentInput";

const ComponentTextareaField: InputComponentType = ({ name, id }) => {
    const { t } = useTranslation("admin");
    const [field, meta] = useField(id);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <div className="is-invalid">
                <textarea placeholder={name} id={name} {...field} />
                <div className="error-message">{t(`${errorText}`)}</div>
            </div>
        );
    }

    return (
        <div>
            <textarea placeholder={name} id={name} {...field} />
        </div>
    );
};

export default ComponentTextareaField;
