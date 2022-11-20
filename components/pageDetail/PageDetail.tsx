import { PageInputsValues } from "@prisma/client";
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
    pageId: string;
}> = ({ name, active, pageId }) => {
    const trpcCtx = trpc.useContext();
    const { t } = useTranslation("common");
    const router = useRouter();
    const { data: components, isLoading } = trpc.useQuery([
        "auth.pages.getCurrentPageComponents",
        {
            name,
        },
    ]);
    const { data: pageInputsValues } = trpc.useQuery(["auth.pages.getPageInputsValues", { pageId }]);
    const { mutate: pageInputValue } = trpc.useMutation(["auth.pages.setNewPageInputValue"]);
    const { mutate: setNewHistoryChangeLog } = trpc.useMutation(["auth.pages.setNewPageHistoryChangeLog"]);

    const initialValues: Record<string, string> = {};

    const buildInitialValues = () => {
        components?.forEach((component) => {
            if (component.input.length <= 0) {
                return initialValues;
            }
            component.input.forEach((input) => {
                const value = pageInputsValues?.find((pageInputValue) => pageInputValue.inputId === input.id);
                if (input.type === "date") {
                    initialValues[value ? value.id : ""] = formatDate(new Date(value ? value.value : ""));
                    return;
                }
                initialValues[value ? value.id : ""] = value ? value.value : "";
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
            component.input.forEach(({ id, name, type, required }) => {
                const value = pageInputsValues?.find((pageInputValue) => pageInputValue.inputId === id);

                inputsFieldConfig.push({
                    id: value ? value.id : id,
                    label: name,
                    placeholder: "",
                    type: "text",
                    validationType: type === "date" ? "date" : "string",
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
            for (const [key, value] of Object.entries(data)) {
                if (key !== "" && value !== "") {
                    pageInputsValues?.forEach((pageInput) => {
                        if (pageInput.id === key) {
                            pageInputValue({
                                inputId: key,
                                value: value,
                            });
                        }
                    });
                }
            }

            buildInitialValues();

            setNewHistoryChangeLog(
                {
                    pageId,
                },
                {
                    onSuccess: () => {
                        trpcCtx.invalidateQueries(["auth.pages.getCurrentPageHistory"]);
                    },
                },
            );

            setSubmitting(false);
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
                    <Formik enableReinitialize initialValues={buildInitialValues()} onSubmit={submitHandler} validationSchema={buildInputFieldConfigSchema()}>
                        {({ isSubmitting }) => (
                            <Form>
                                {components.map((component, index) => (
                                    <div className="component" key={index}>
                                        <div className="head">{component.name}</div>
                                        <ComponentInput pageId={pageId} componentId={component.id} />
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

const formatDate = (date: Date): string => {
    const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
    const month = `${date.getMonth() + 1 < 10 ? "0" : ""}${date.getMonth() + 1}`;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
};
