import { object, string } from "yup";

export const admin = () => {
    return object({
        email: string().email("validEmail").required("requiredEmail"),
        password: string().required("requiredPassword"),
    });
};
