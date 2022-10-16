import { object, string } from "yup";

export const admin = () => {
    return object({
        email: string().email("Email need to be valid").required("This field is required"),
        password: string().required("Password is a required field"),
    });
};
