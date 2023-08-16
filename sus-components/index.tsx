import { FC } from "react";
import { Test1 } from "./test1/Test1";
import { Test2 } from "./test2";

export type SusComponetsType = FC<{
    susProps: {
        pageComponentId: string;
        pageId: string;
        language: string;
    };
}>;

export const SusComponents: { [key: string]: SusComponetsType } = {
    header: Test1,
    section1: Test2,
    section2: Test2,
};
