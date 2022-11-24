import { FC, createElement } from "react";
import ComponentCheckboxField from "../../elements/inputFields/components/ComponentCheckboxField";
import ComponentDateField from "../../elements/inputFields/components/ComponentDateField";
import ComponentEmailField from "../../elements/inputFields/components/ComponentEmailField";
import ComponentNumberField from "../../elements/inputFields/components/ComponentNumberField";
import ComponentRadioField from "../../elements/inputFields/components/ComponentRadioField";
import ComponentSelectField from "../../elements/inputFields/components/ComponentSelectField";
import ComponentTextareaField from "../../elements/inputFields/components/ComponentTextareaField";
import ComponentTextField from "../../elements/inputFields/components/ComponentTextField";
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
    componentId: string;
    pageId: string;
}> = ({ componentId, pageId }) => {
    const { data: input } = trpc.useQuery(["auth.inputs.get", { componentId, pageId }]);

    return (
        <div className="component-inputs">
            {!input ? (
                <div>Loading...</div>
            ) : (
                <>
                    {input.map((input, index) => {
                        const types = Object.keys(AvaiblableComponentsInputList).filter((key) => isNaN(Number(key)));
                        const inputs: JSX.Element[] = [];

                        types.forEach((type) => {
                            if (input.type?.toLowerCase() === type.toLowerCase()) {
                                const inputValue = input.value[0];

                                inputs.push(
                                    <div key={index} className={`row${input.halfRow ? " row-half" : ""}`}>
                                        <label htmlFor={input.name}>
                                            {input.name}
                                            {input.required ? "*" : ""}
                                        </label>
                                        {ComponentInputBuilder(input.type, input.name, inputValue ? inputValue.id : "undefined", input.id)}
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
