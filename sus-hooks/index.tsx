import { trpc } from "../src/utils/trpc";

export const useSusInputs = (id: { pageComponentId: string; pageId: string }) => {
    const { data } = trpc.useQuery(["inputs.get", { ...id }]);

    let extractedData: Record<string, string> = {};

    data?.forEach((component) => {
        const name = component.input.name;
        const value = component.value;

        if (typeof value === "undefined" || typeof name === "undefined") {
            return;
        }

        extractedData[name] = value;
    });

    return {
        data: extractedData,
    };
};
