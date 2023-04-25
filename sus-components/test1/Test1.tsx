import { FC } from "react";
import { useSusInputs } from "../../sus-hooks";
import { SusComponetsType } from "..";

export const Test1: SusComponetsType = ({ id }) => {
    const { data } = useSusInputs(id);
    const { dfsfds } = data;

    return (
        <>
            <h1 className="headline h1">{dfsfds}</h1>
        </>
    );
};
