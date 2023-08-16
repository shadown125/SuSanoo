import { useSusInputs } from "../../sus-hooks";
import { SusComponetsType } from "..";

export const Test2: SusComponetsType = ({ susProps }) => {
    const { data } = useSusInputs(susProps);
    const { text, text2 } = data;

    return (
        <>
            <h1 className="headline h1">{text}</h1>
            <h1 className="headline h3">{text2}</h1>
        </>
    );
};
