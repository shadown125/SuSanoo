import { admin } from "../../schemas/validation/admin";
import { Form, Formik } from "formik";
import EmailField from "../../elements/inputFields/EmailField";
import PasswordField from "../../elements/inputFields/PasswordField";
import { useTranslation } from "next-i18next";

const AdminForm = () => {
    const { t } = useTranslation("common");

    const submitHandler = (data: { email: string; password: string }, { setSubmitting, resetForm }: { setSubmitting: Function; resetForm: Function }) => {};

    return (
        <>
            <div className={`notification notification--${notification}${notification && " is-active"}`}>{t(`admin:${errorMessage}`)}</div>
            <Formik initialValues={{ email: "", password: "" }} onSubmit={submitHandler} validationSchema={admin}>
                {({ isSubmitting }) => (
                    <Form>
                        <div className="row login">
                            <EmailField name="email" />
                        </div>
                        <div className="row password">
                            <PasswordField name="password" />
                        </div>
                        <button className="button is-login" disabled={isSubmitting} type="submit">
                            {t("common:login")}
                            <span></span>
                        </button>
                    </Form>
                )}
            </Formik>
        </>
    );
};

export default AdminForm;
