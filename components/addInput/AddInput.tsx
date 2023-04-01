import { Form, Formik } from "formik";
import { useTranslation } from "next-i18next";
import { FC, useState } from "react";
import { boolean, object, string } from "yup";
import shallow from "zustand/shallow";
import CheckboxField from "../../elements/inputFields/CheckboxField";
import TextField from "../../elements/inputFields/TextField";
import { useComponentsStore } from "../../src/store/components-store";
import { usePopupStore } from "../../src/store/store";
import { FormikSubmission } from "../../src/types/formik";
import { trpc } from "../../src/utils/trpc";
import { InputsTypes } from "@prisma/client";

const validationSchema = object({
    required: boolean().required(),
    name: string().required().min(3).max(26),
});

const AddInput: FC = () => {
    const context = trpc.useContext();

    const { t } = useTranslation("common");
    const [selectedType, setSelectedType] = useState<string>("");
    const { addInputPopupState, setInputPopupState } = usePopupStore(
        (state) => ({
            addInputPopupState: state.addInputPopupState,
            setInputPopupState: state.setAddInputPopupState,
        }),
        shallow,
    );
    const { mutate: input } = trpc.useMutation(["auth.inputs.create"]);
    const { mutate: componentHistory } = trpc.useMutation(["auth.components.addNewHistoryChangeLog"]);

    const componentId = useComponentsStore((state) => state.componentId);

    const resetInputType = () => {
        setSelectedType("");
    };

    const closePopup = () => {
        setInputPopupState(false);
    };

    const submitHandler = (data: { required: boolean; name: string; half: boolean }, { setSubmitting, resetForm }: FormikSubmission) => {
        try {
            const { required, name, half } = data;

            input(
                { componentId, required: required, name: name, halfRow: half, type: selectedType as InputsTypes },
                {
                    onSuccess: () => {
                        setInputPopupState(false);
                        context.invalidateQueries(["auth.components.get"]);
                    },
                },
            );
            componentHistory(
                {
                    componentId,
                },
                {
                    onSuccess: () => {
                        context.invalidateQueries(["auth.components.getCurrentComponentsHistory"]);
                    },
                },
            );

            setTimeout(() => {
                resetInputType();
            }, 200);
            setSubmitting(false);
            resetForm(true);
        } catch (error) {
            setSubmitting(false);
            resetForm(false);
        }
    };

    return (
        <div className={`popup add-input-popup${addInputPopupState ? " is-active" : ""}`}>
            <div className="blur-background" onClick={() => setInputPopupState(false)} />
            <div className="container">
                {!selectedType ? (
                    <>
                        <h2 className="headline title h4">{t("selectInput")}</h2>
                        <div className="inputs-container">
                            {Object.entries(InputsTypes).map(([key]) => (
                                <div key={key} className="input-type" onClick={() => setSelectedType(key)}>
                                    <span>{key}</span>
                                </div>
                            ))}
                            <div className="actions">
                                <button className="button is-primary back" type="button" onClick={closePopup}>
                                    <span>{t("back")}</span>
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="headline title h4">{t("selectInputOptions")}</h2>
                        <Formik initialValues={{ required: false, name: "", half: false }} onSubmit={submitHandler} validationSchema={validationSchema}>
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className="row required">
                                        <CheckboxField name="required" label="required" />
                                    </div>
                                    <div className="row">
                                        <CheckboxField name="half" label="is half" />
                                    </div>
                                    <div className="row name">
                                        <label htmlFor="name">Name</label>
                                        <TextField name="name" />
                                    </div>
                                    <div className="actions">
                                        <button className="button is-primary back" type="button" onClick={resetInputType}>
                                            <span>{t("back")}</span>
                                        </button>
                                        <button className="button is-primary submit" disabled={isSubmitting} type="submit">
                                            <span>{t("save")}</span>
                                        </button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </>
                )}
            </div>
        </div>
    );
};

export default AddInput;
