import { NextPage } from "next";
import { Form, Formik } from "formik";
import EmailField from "../../../elements/inputFields/EmailField";
import { admin } from "../../../schemas/validation/admin";
import PasswordField from "../../../elements/inputFields/PasswordField";

const Admin: NextPage = () => {
    const submitHandler = (data: { email: string; password: string }, { setSubmitting, resetForm }: { setSubmitting: Function; resetForm: Function }) => {};

    return (
        <section className="section admin">
            <div className="wrapper">
                <div className="grid--centered">
                    <div className="container">
                        <div className="content">
                            <h1 className="headline h2">Susanoo</h1>
                            <span>Please login to use Susanoo</span>
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
                                            Login
                                            <span></span>
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                            <span className="account">Don't have an account? Contact owner for getting one</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Admin;
