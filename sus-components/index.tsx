import { FC } from "react";
import { Test1 } from "./test1/Test1";
import { Test2 } from "./test2";

export type SusComponetsType = FC<{
    id: {
        componentId: string;
        pageId: string;
    };
}>;

export const SusComponents: { [key: string]: SusComponetsType } = {
    header: Test1,
    test2: Test2,
};
