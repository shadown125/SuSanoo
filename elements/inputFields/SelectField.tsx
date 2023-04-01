import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { FC } from "react";

const SelectField: FC<{ name: string; children: JSX.Element | JSX.Element[] }> = (props) => {
    const { t } = useTranslation("admin");
    const [field, meta] = useField(props);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <div className="is-invalid">
                <select {...field}>{props.children}</select>
                <div className="error-message">{t(`${errorText}`)}</div>
            </div>
        );
    }

    return (
        <div>
            <select {...field}>{props.children}</select>
        </div>
    );
};

export default SelectField;
