import { FC, createElement } from "react";
import ComponentCheckboxField from "../../elements/inputFields/components/ComponentCheckboxField";
import ComponentDateField from "../../elements/inputFields/components/ComponentDateField";
import ComponentEmailField from "../../elements/inputFields/components/ComponentEmailField";
import ComponentNumberField from "../../elements/inputFields/components/ComponentNumberField";
import ComponentRadioField from "../../elements/inputFields/components/ComponentRadioField";
import ComponentSelectField from "../../elements/inputFields/components/ComponentSelectField";
import ComponentTextareaField from "../../elements/inputFields/components/ComponentTextareaField";
import ComponentTextField from "../../elements/inputFields/components/ComponentTextField";
import { useDetailPageStore } from "../../src/store/store";
import { trpc } from "../../src/utils/trpc";

export type InputComponentType = FC<{
    name: string;
    id: string;
    rawId?: string;
}>;

const AvaiblableComponentsInputList: { [key: string]: InputComponentType } = {
    text: ComponentTextField,
    textarea: ComponentTextareaField,
    email: ComponentEmailField,
    date: ComponentDateField,
    number: ComponentNumberField,
    checkbox: ComponentCheckboxField,
    radio: ComponentRadioField,
    select: ComponentSelectField,
};

const ComponentInputBuilder = (type: string, name: string, id: string, rawId: string) => {
    if (typeof AvaiblableComponentsInputList[type] === "undefined") {
        return <></>;
    }
    return createElement(AvaiblableComponentsInputList[type] as InputComponentType, { key: name, name, id, rawId });
};

const ComponentInput: FC<{
    pageId: string;
    pageComponentId: string;
}> = ({ pageId, pageComponentId }) => {
    const { data: pageInputValue } = trpc.useQuery(["auth.inputs.getPageInputValues", { pageComponentId, pageId }]);
    const editState = useDetailPageStore((state) => state.editState);

    return (
        <div className={`component-inputs${editState ? " is-active" : ""}`}>
            {!pageInputValue ? (
                <div>Loading...</div>
            ) : (
                <>
                    {pageInputValue.map((pageInput, index) => {
                        const types = Object.keys(AvaiblableComponentsInputList).filter((key) => isNaN(Number(key)));
                        const inputs: JSX.Element[] = [];

                        types.forEach((type) => {
                            if (pageInput.input.type?.toLowerCase() === type.toLowerCase()) {
                                inputs.push(
                                    <div key={index} className={`row${pageInput.input.halfRow ? " row-half" : ""}`}>
                                        <label htmlFor={pageInput.input.name}>
                                            {pageInput.input.name}
                                            {pageInput.input.required ? "*" : ""}
                                        </label>
                                        {ComponentInputBuilder(pageInput.input.type, pageInput.input.name, pageInput.id, pageInput.id)}
                                    </div>,
                                );
                            }
                        });

                        return inputs;
                    })}
                </>
            )}
        </div>
    );
};

export default ComponentInput;
