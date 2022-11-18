import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import ComponentInputBuilder, { inputType } from "./ComponentInput";

const ComponentCheckboxField: InputComponentType = ({ name, id }) => {
    return <ComponentInputBuilder name={name} id={id} type={inputType.checkbox} />;
};

export default ComponentCheckboxField;
