import { useField } from "formik";
import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import ComponentInputBuilder, { inputType } from "./ComponentInput";

const ComponentTextareaField: InputComponentType = ({ name, id }) => {
    return <ComponentInputBuilder name={name} id={id} type={inputType.textarea} />;
};

export default ComponentTextareaField;
