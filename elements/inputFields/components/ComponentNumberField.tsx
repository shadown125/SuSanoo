import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import ComponentInputBuilder, { inputType } from "./ComponentInput";

const ComponentNumberField: InputComponentType = ({ name, id }) => {
    return <ComponentInputBuilder name={name} id={id} type={inputType.number} />;
};

export default ComponentNumberField;
