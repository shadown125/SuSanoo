import { Input } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FC } from "react";
import { useComponentsStore } from "../../src/store/components-store";
import { usePopupStore } from "../../src/store/store";
import AddInput from "../addInput/AddInput";
import EditPopup from "./EditPopup";

const ComponentDetail: FC<{
    name: string;
    inputs: Input[];
}> = ({ name, inputs }) => {
    const { t } = useTranslation("common");
    const router = useRouter();

    const setAddInputPopupState = usePopupStore((state) => state.setAddInputPopupState);
    const { setEditInputId, setIsEditPopupOpen } = useComponentsStore((state) => ({
        setIsEditPopupOpen: state.setIsEditPopupOpen,
        setEditInputId: state.setEditInputId,
    }));

    return (
        <div className="components-detail">
            <div className="head">
                <h2 className="headline h4">{name}</h2>
            </div>
            <div className="container">
                <div className="component-inputs is-preview">
                    {inputs.map((input, index) => (
                        <div key={index} className={`row${input.halfRow ? " row-half" : ""}`}>
                            <label htmlFor={input.name}>
                                {input.name}
                                {input.required ? "*" : ""}
                            </label>
                            <div>
                                <div className={`input ${input.type}`} />
                            </div>
                            <button
                                className="button is-primary edit"
                                onClick={() => {
                                    setEditInputId(input.id);
                                    setIsEditPopupOpen(true);
                                }}
                            >
                                <span>Edit input</span>
                            </button>
                        </div>
                    ))}
                </div>
                <button className="button is-tertiary add-input" onClick={() => setAddInputPopupState(true)}>
                    <span>Add new input</span>
                </button>
            </div>
            <div className="actions">
                <button className="button is-primary back" type="button" onClick={router.back}>
                    <span>{t("back")}</span>
                </button>
            </div>
            <AddInput />
            <EditPopup />
        </div>
    );
};

export default ComponentDetail;
