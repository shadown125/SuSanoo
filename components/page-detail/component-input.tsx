import { createElement, FC } from "react";
import { api } from "@/utils/api";
import ComponentCheckboxField from "../../elements/input-fields/components/component-checkbox-field";
import ComponentDateField from "../../elements/input-fields/components/component-date-field";
import ComponentEmailField from "../../elements/input-fields/components/component-email-field";
import ComponentNumberField from "../../elements/input-fields/components/component-number-field";
import ComponentRadioField from "../../elements/input-fields/components/component-radio-field";
import ComponentSelectField from "../../elements/input-fields/components/component-select-field";
import ComponentTextField from "../../elements/input-fields/components/component-text-field";
import ComponentTextareaField from "../../elements/input-fields/components/component-textarea-field";
import { useDetailPageStore } from "../../src/store/store";

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

export const ComponentInputBuilder = (
  type: string,
  name: string,
  id: string,
  rawId: string,
) => {
  if (typeof AvaiblableComponentsInputList[type] === "undefined") {
    return <></>;
  }
  return createElement(
    AvaiblableComponentsInputList[type] as InputComponentType,
    { key: name, name, id, rawId },
  );
};

const ComponentInput: FC<{
  pageId: string;
  pageComponentId: string;
}> = ({ pageId, pageComponentId }) => {
  const { data: pageInputValue } = api.authInputs.getPageInputValues.useQuery({
    pageComponentId,
    pageId,
  });

  const editState = useDetailPageStore((state) => state.editState);

  return (
    <div className={`component-inputs${editState ? " is-active" : ""}`}>
      {!pageInputValue ? (
        <div>Loading...</div>
      ) : (
        <>
          {pageInputValue.map((pageInput, index) => {
            const types = Object.keys(AvaiblableComponentsInputList).filter(
              (key) => isNaN(Number(key)),
            );
            const inputs: JSX.Element[] = [];

            types.forEach((type) => {
              if (
                pageInput.input.type?.toLowerCase() === type.toLowerCase() &&
                !pageInput.input.componentItemId
              ) {
                inputs.push(
                  <div
                    key={index}
                    className={`row${
                      pageInput.input.halfRow ? " row-half" : ""
                    }`}
                  >
                    <label htmlFor={pageInput.input.name}>
                      {pageInput.input.name}
                      {pageInput.input.required ? "*" : ""}
                    </label>
                    {ComponentInputBuilder(
                      pageInput.input.type,
                      pageInput.input.name,
                      pageInput.id,
                      pageInput.id,
                    )}
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
