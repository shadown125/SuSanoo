import { Input } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FC, useState } from "react";
import { useComponentsStore } from "../../src/store/components-store";
import { usePopupStore } from "../../src/store/store";
import AddInput from "../addInput/AddInput";
import EditPopup from "./EditPopup";
import { trpc } from "../../src/utils/trpc";

const ComponentDetail: FC<{
    componentKey: string;
    name: string;
    inputs: Input[];
}> = ({ name, inputs, componentKey }) => {
    const { t } = useTranslation("common");
    const { t: tAdmin } = useTranslation("admin");
    const router = useRouter();

    const { mutate: deleteComponent } = trpc.useMutation("auth.components.delete");

    const setAddInputPopupState = usePopupStore((state) => state.setAddInputPopupState);
    const { setEditInputId, setIsEditPopupOpen, componentId } = useComponentsStore((state) => ({
        componentId: state.componentId,
        setIsEditPopupOpen: state.setIsEditPopupOpen,
        setEditInputId: state.setEditInputId,
    }));

    const [removeComponentPopupOpen, setRemoveComponentPopupOpen] = useState<boolean>(false);

    const handleDeleteComponent = () => {
        deleteComponent(
            { id: componentId },
            {
                onSuccess: () => {
                    router.push("/admin/components");
                },
            },
        );
    };

    return (
        <div className="components-detail">
            <div className="head">
                <div className="head-upper">
                    <h2 className="headline h4">{name}</h2>
                    <button className="button is-primary" onClick={() => setRemoveComponentPopupOpen(true)}>
                        <span>{tAdmin("removeComponent")}</span>
                    </button>
                </div>
                <h3 className="headline h5 component-key">
                    <span>{t("componentKey")}:</span> {componentKey}
                </h3>
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
                <button className="button is-primary back" type="button" onClick={() => router.push("/admin/components")}>
                    <span>{t("back")}</span>
                </button>
            </div>
            <div className={`popup${removeComponentPopupOpen ? " is-active" : ""} remove-component-popup`}>
                <div className="blur-background" onClick={() => setRemoveComponentPopupOpen(false)} />
                <div className="container">
                    <h2 className="headline h4">{tAdmin("removeComponent")}</h2>
                    <p>{tAdmin("removeComponentText")}</p>
                    <div className="actions">
                        <button className="button is-primary back" type="button" onClick={() => setRemoveComponentPopupOpen(false)}>
                            <span>{t("back")}</span>
                        </button>
                        <button className="button is-primary remove" type="button" onClick={handleDeleteComponent}>
                            <span>{t("remove")}</span>
                        </button>
                    </div>
                </div>
            </div>
            <AddInput />
            <EditPopup />
        </div>
    );
};

export default ComponentDetail;
