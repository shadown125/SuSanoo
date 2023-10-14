import { useState, type FC } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import EmailField from "elements/input-fields/email-field";
import PasswordField from "elements/input-fields/password-field";
import { Form, Formik } from "formik";
import { signIn } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { admin } from "validation/admin";
import { type FormikSubmission } from "../src/types/formik";
import { type response } from "../src/types/response";

type SubmitData = {
  email: string;
  password: string;
};

const AdminForm: FC = () => {
  const { t } = useTranslation("");
  const router = useRouter();
  const [notification, setNotification] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const { mutate: status } = api.auth.setUserStatus.useMutation();

  const submitHandler = async (
    data: SubmitData,
    { setSubmitting, resetForm }: FormikSubmission,
  ): Promise<void> => {
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

      status({ status: true });
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
      <div
        className={`notification notification--${notification}${
          notification && " is-active"
        }`}
      >
        {t(`admin:${errorMessage}`)}
      </div>
      <Formik
        initialValues={{ email: "", password: "" }}
        onSubmit={submitHandler}
        validationSchema={admin}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="row login">
              <EmailField name="email" />
            </div>
            <div className="row password">
              <PasswordField name="password" />
            </div>
            <button
              className="button is-login"
              disabled={isSubmitting}
              type="submit"
            >
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
