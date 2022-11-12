import { Form, Formik } from "formik";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FC } from "react";
import * as yup from "yup";
import { FormikSubmission } from "../../src/types/formik";
import { trpc } from "../../src/utils/trpc";
import ComponentInput from "./ComponentInput";

const PageDetail: FC<{
    name: string;
    active: boolean;
}> = ({ name, active }) => {
    const { t } = useTranslation("common");
    const router = useRouter();
    const { data: components, isLoading } = trpc.useQuery([
        "auth.pages.getCurrentPageComponents",
        {
            name,
        },
    ]);

    const initialValues: Record<string, string> = {};

    const buildInitialValues = () => {
        components?.forEach((component) => {
            if (component.input.length <= 0) {
                return initialValues;
            }
            component.input.forEach((input) => {
                initialValues[input.name.toLowerCase()] = "";
            });
        });

        return initialValues;
    };

    const buildInputFieldConfigSchema = () => {
        const inputsFieldConfig: {}[] = [];

        components?.forEach((component) => {
            if (component.input.length <= 0) {
                return inputsFieldConfig;
            }
            component.input.forEach(({ name, type, required }) => {
                inputsFieldConfig.push({
                    id: name,
                    label: name,
                    placeholder: "",
                    type: "text",
                    validationType: type === "number" || type === "date" ? "number" : "string",
                    required: required,
                    value: undefined,
                    validations: [
                        required && {
                            type: "required",
                            params: [t("validation.required")],
                        },
                        type === "email" && {
                            type: "email",
                            params: [t("validation.email")],
                        },
                    ],
                });
            });
        });

        const yepSchema = inputsFieldConfig.reduce(buildValidationSchema, {});

        return yup.object().shape(yepSchema);
    };

    const submitHandler = (data: typeof initialValues, { setSubmitting, resetForm }: FormikSubmission) => {
        try {
            console.log(data);
            setSubmitting(false);
            resetForm(true);
        } catch (error) {
            throw new Error(error as string);
        }
    };

    return (
        <div className="pages-detail">
            <div className="head">
                <h1 className="headline h1">{name}</h1>
                <div className={`status${active ? " active" : " inactive"}`}>
                    <span className="label">{active ? t("pages:active") : t("common:inactive")}</span>
                </div>
            </div>
            {!components || isLoading ? (
                <div>Loading...</div>
            ) : (
                <div className="container">
                    <Formik initialValues={buildInitialValues()} onSubmit={submitHandler} validationSchema={buildInputFieldConfigSchema()}>
                        {({ isSubmitting }) => (
                            <Form>
                                {components.map((component, index) => (
                                    <div className="component" key={index}>
                                        <div className="head">{component.name}</div>
                                        <ComponentInput componentId={component.id} />
                                    </div>
                                ))}
                                <div className="actions">
                                    <button className="button is-primary back" type="button" onClick={router.back}>
                                        <span>{t("back")}</span>
                                    </button>
                                    <button className="button is-primary submit" disabled={isSubmitting} type="submit">
                                        <span>{t("save")}</span>
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}
        </div>
    );
};

export default PageDetail;

// TODO: Fix types
const buildValidationSchema = (schema: any, config: any) => {
    const { id, validationType, validations = [] } = config;

    if (!(yup as any)[validationType]) {
        return schema;
    }

    let validator = (yup as any)[validationType]();

    validations.forEach((validation: any) => {
        const { params, type } = validation;
        if (!validator[type]) {
            return;
        }
        validator = validator[type](...params);
    });

    schema[id] = validator;
    return schema;
};
