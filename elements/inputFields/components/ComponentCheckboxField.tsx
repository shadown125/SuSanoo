import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/pageDetail/ComponentInput";

const ComponentCheckboxField: InputComponentType = ({ name }) => {
    const { t } = useTranslation("admin");
    const [field, meta] = useField(name);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <>
                <input type="checkbox" {...field} />
                <div className="error-message">{t(`${errorText}`)}</div>
            </>
        );
    }

    return <input type="checkbox" {...field} />;
};

export default ComponentCheckboxField;