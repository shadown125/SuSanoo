import { useField } from "formik";
import { useTranslation } from "next-i18next";

const PasswordField = (props: { name: string }) => {
    const { t } = useTranslation();
    const [field, meta] = useField(props);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <>
                <div className="input is-icon is-invalid">
                    <input type="password" placeholder="Password" {...field} />
                </div>
                <div className="error-message">{t(`admin:${errorText}`)}</div>
            </>
        );
    }

    return (
        <div className="input is-icon">
            <input type="password" placeholder={t("common:password")} {...field} />
        </div>
    );
};

export default PasswordField;
