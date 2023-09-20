import { InputsTypes } from "@prisma/client";
import { Form, Formik } from "formik";
import { useTranslation } from "next-i18next";
import { FC } from "react";
import { boolean, object, string } from "yup";
import CheckboxField from "../../elements/inputFields/CheckboxField";
import SelectField from "../../elements/inputFields/SelectField";
import TextField from "../../elements/inputFields/TextField";
import { useComponentsStore } from "../../src/store/components-store";
import { FormikSubmission } from "../../src/types/formik";
import { trpc } from "../../src/utils/trpc";

const validationSchema = object({
    required: boolean().required(),
    name: string().required().min(3).max(26),
    half: boolean().required(),
});

const EditPopup: FC = () => {
    const { t } = useTranslation("common");
    const context = trpc.useContext();

    const { componentId, editInputId, isEditPopupOpen, setIsEditPopupOpen, isItemInput } = useComponentsStore((state) => ({
        isEditPopupOpen: state.isEditPopupOpen,
        setIsEditPopupOpen: state.setIsEditPopupOpen,
        editInputId: state.editInputId,
        componentId: state.componentId,
        isItemInput: state.isItemInput,
    }));

    const { data: input } = trpc.useQuery(["auth.inputs.getById", editInputId]);
    const { mutate: inputDelete } = trpc.useMutation(["auth.inputs.delete"]);
    const { mutate: inputUpdate } = trpc.useMutation(["auth.inputs.update"]);
    const { mutate: componentHistory } = trpc.useMutation(["auth.components.addNewHistoryChangeLog"]);

    const submitHandler = (data: { required: boolean; name: string; half: boolean; inputTypes: InputsTypes | null }, { setSubmitting, resetForm }: FormikSubmission) => {
        try {
            const { required, name, half } = data;

            inputUpdate(
                {
                    id: editInputId,
                    required: required,
                    name: name,
                    halfRow: half,
                    type: data.inputTypes as InputsTypes,
                },
                {
                    onSuccess: () => {
                        context.invalidateQueries(["auth.components.get"]);
                        context.invalidateQueries(["auth.inputs.getById"]);

                        setIsEditPopupOpen(false);
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

            setSubmitting(false);
            resetForm(true);
        } catch (error) {
            setSubmitting(false);
            resetForm(false);
        }
    };

    const handleInputDelete = () => {
        inputDelete(
            {
                id: editInputId,
            },
            {
                onSuccess: () => {
                    context.invalidateQueries(["auth.components.get"]);
                    setIsEditPopupOpen(false);
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
    };

    return (
        <div className={`popup edit-input-popup${isEditPopupOpen ? " is-active" : ""}`}>
            <div className="blur-background" onClick={() => setIsEditPopupOpen(false)} />
            <div className="container">
                {!input ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <h2 className="headline h2">{input.name}</h2>
                        <Formik
                            initialValues={{ required: input.required, name: input.name, half: input.halfRow, inputTypes: input.type }}
                            onSubmit={submitHandler}
                            validationSchema={validationSchema}
                            enableReinitialize
                        >
                            {({ isSubmitting }) => (
                                <Form>
                                    <div className="form-container">
                                        <div className="row row-half required">
                                            <CheckboxField name="required" label="required" />
                                        </div>
                                        <div className="row row-half">
                                            <CheckboxField name="half" label="is-half" />
                                        </div>
                                        <div className="row">
                                            <label htmlFor="input-type">Input Type</label>
                                            <SelectField name="inputTypes">
                                                {Object.keys(InputsTypes).map((key, value) => (
                                                    <option key={value} value={key}>
                                                        {key}
                                                    </option>
                                                ))}
                                            </SelectField>
                                        </div>
                                        <div className="row name">
                                            <label htmlFor="name">Name</label>
                                            <TextField name="name" />
                                        </div>
                                        <div className="actions">
                                            <button className="button is-primary delete-button" type="button" onClick={handleInputDelete}>
                                                <span>{t("delete")}</span>
                                            </button>
                                            <button className="button is-primary submit" type="submit" disabled={isSubmitting}>
                                                <span>{t("save")}</span>
                                            </button>
                                        </div>
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

export default EditPopup;
