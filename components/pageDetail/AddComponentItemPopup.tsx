import { FC } from "react";
import { useDetailPageStore } from "../../src/store/store";
import { Formik, Form } from "formik";
import { object, string } from "yup";
import TextField from "../../elements/inputFields/TextField";
import { useTranslation } from "next-i18next";
import { trpc } from "../../src/utils/trpc";
import { buildValidationSchema } from "./PageDetail";
import shallow from "zustand/shallow";
import { ComponentInputBuilder } from "./ComponentInput";

const validationSchema = object({
    itemName: string().required("itemNameRequired"),
});

const AddComponentItemPopup: FC<{
    pageId: string;
}> = ({ pageId }) => {
    const { t } = useTranslation("admin");
    const { t: tPages } = useTranslation("pages");

    const trpcCtx = trpc.useContext();

    const { componentId, addComponentItemPopup, setAddComponentItemPopup } = useDetailPageStore(
        (state) => ({
            componentId: state.componentId,
            addComponentItemPopup: state.addComponentItemPopup,
            setAddComponentItemPopup: state.setAddComponentItemPopup,
        }),
        shallow,
    );

    const { data: component, isLoading } = trpc.useQuery(["auth.components.getPageComponentById", { id: componentId }]);

    const { mutate: addComponentItem } = trpc.useMutation(["auth.pages.createPageComponentItem"]);

    const filteredInputs = component?.componentItems.inputs.filter((input) => input.componentItemId);

    const initialValues: Record<string, string> = {};

    const buildInitialValues = () => {
        filteredInputs?.forEach((input) => {
            initialValues[input.id] = "";
        });

        return { itemName: "", ...initialValues };
    };

    const buildInputFieldConfigSchema = () => {
        const inputsFieldConfig: {}[] = [];

        filteredInputs?.forEach(({ id, name, type, required }) => {
            inputsFieldConfig.push({
                id: id,
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

        const yepSchema = inputsFieldConfig.reduce(buildValidationSchema, {});

        return object().shape(yepSchema).concat(validationSchema);
    };

    const submitHandler = (data: typeof initialValues, { setSubmitting, resetForm }: any) => {
        try {
            addComponentItem(
                {
                    componentId: componentId,
                    name: data.itemName as string,
                    pageId: component?.pageId as string,
                    pageComponentData: data,
                },
                {
                    onSuccess: () => {
                        trpcCtx.invalidateQueries(["auth.pages.getCurrentPageComponents"]);
                        trpcCtx.invalidateQueries(["auth.pages.getPageInputsValues"]);
                    },
                },
            );

            setAddComponentItemPopup(false);

            setSubmitting(false);
            resetForm(true);
        } catch (err) {
            setSubmitting(false);

            throw new Error(err as string);
        }
    };

    return (
        <div className={`popup add-component-item-popup${addComponentItemPopup ? " is-active" : ""}`}>
            <div className="blur-background" onClick={() => setAddComponentItemPopup(false)} />
            <div className="container">
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    <Formik enableReinitialize={true} initialValues={buildInitialValues()} onSubmit={submitHandler} validationSchema={buildInputFieldConfigSchema()}>
                        {({ isSubmitting }) => (
                            <Form>
                                <div className="row">
                                    <label htmlFor="name">{tPages("itemName")}:</label>
                                    <TextField name="itemName" />
                                </div>
                                {filteredInputs?.map(({ id, type, name }) => (
                                    <div className="row" key={id}>
                                        <label htmlFor={name}>{name}:</label>
                                        {ComponentInputBuilder(type as string, name, id, id)}
                                    </div>
                                ))}
                                <div className="actions">
                                    <button className="button is-primary back" type="button" onClick={() => setAddComponentItemPopup(false)}>
                                        <span>{t("back")}</span>
                                    </button>
                                    <button className="button is-primary submit" disabled={isSubmitting} type="submit">
                                        <span>{t("save")}</span>
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}
            </div>
        </div>
    );
};

export default AddComponentItemPopup;
