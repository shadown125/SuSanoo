import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/pageDetail/ComponentInput";

const ComponentTextareaField: InputComponentType = ({ name }) => {
    const { t } = useTranslation("admin");
    const [field, meta] = useField(name);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <>
                <textarea placeholder={field.name} {...field} />
                <div className="error-message">{t(`${errorText}`)}</div>
            </>
        );
    }

    return <textarea placeholder={field.name} {...field} />;
};

export default ComponentTextareaField;
