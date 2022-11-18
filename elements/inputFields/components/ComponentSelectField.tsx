import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import ComponentInputBuilder, { inputType } from "./ComponentInput";

const ComponentSelectField: InputComponentType = ({ name, id, rawId }) => {
    return <ComponentInputBuilder name={name} id={id} type={inputType.select} rawId={rawId} />;
};

export default ComponentSelectField;
