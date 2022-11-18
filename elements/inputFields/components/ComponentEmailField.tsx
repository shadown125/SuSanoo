import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import ComponentInputBuilder, { inputType } from "./ComponentInput";

const ComponentEmailField: InputComponentType = ({ name, id }) => {
    return <ComponentInputBuilder name={name} id={id} type={inputType.email} />;
};

export default ComponentEmailField;
