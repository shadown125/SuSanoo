import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import ComponentInputBuilder, { inputType } from "./ComponentInput";

const ComponentDateField: InputComponentType = ({ name, id }) => {
    return <ComponentInputBuilder name={name} id={id} type={inputType.date} />;
};

export default ComponentDateField;
