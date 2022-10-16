import { useField } from "formik";

const PasswordField = (props: { name: string }) => {
    const [field, meta] = useField(props);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <>
                <div className="input is-icon is-invalid">
                    <input type="password" placeholder="Password" {...field} />
                </div>
                <div className="error-message">{errorText}</div>
            </>
        );
    }

    return (
        <div className="input is-icon">
            <input type="password" placeholder="Password" {...field} />
        </div>
    );
};

export default PasswordField;
