import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { FC } from "react";

const CheckboxField: FC<{ name: string; label: string }> = (props) => {
    const { t } = useTranslation("admin");
    const [field, meta] = useField(props);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <>
                <div className="input is-checkbox is-invalid">
                    <input type="checkbox" className={field.value ? "is-checked" : ""} id={props.name} {...field} />
                    <label htmlFor={props.name}>{t(`${props.label}`)}</label>
                </div>
                <div className="error-message">{t(`${errorText}`)}</div>
            </>
        );
    }

    return (
        <div className="input is-checkbox">
            <input type="checkbox" className={field.value ? "is-checked" : ""} id={props.name} {...field} />
            <label htmlFor={props.name}>{t(`${props.label}`)}</label>
        </div>
    );
};

export default CheckboxField;
