import { admin } from "../../schemas/validation/admin";
import { Form, Formik } from "formik";
import EmailField from "../../elements/inputFields/EmailField";
import PasswordField from "../../elements/inputFields/PasswordField";
import { useTranslation } from "next-i18next";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { response } from "../../src/types/response";
import { FormikSubmission } from "../../src/types/formik";
import { trpc } from "../../src/utils/trpc";

type SubmitData = {
    email: string;
    password: string;
};

const AdminForm: FC = () => {
    const { t } = useTranslation("");
    const router = useRouter();
    const [notification, setNotification] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");

    const { mutate: status } = trpc.useMutation(["auth.setUserStatus"]);

    const submitHandler = async (data: SubmitData, { setSubmitting, resetForm }: FormikSubmission) => {
        try {
            const response = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
            }).then((response) => response as unknown as response);

            const error = response.error;

            if (error !== null) {
                setNotification("failed");
                setErrorMessage(error);
                return;
            }

            await status({ status: true });
            await router.replace(`${router.locale}/admin/panel`);

            setNotification("");
            setSubmitting(false);
            resetForm(true);
        } catch (error) {
            throw new Error(error as string);
        }
    };

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
