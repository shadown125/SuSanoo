import { trpc } from "../src/utils/trpc";

export const useSusInputs = (id: { componentId: string; pageId: string }) => {
    const { data } = trpc.useQuery(["inputs.get", { ...id }]);

    let extractedData: Record<string, string> = {};

    data?.forEach((input) => {
        const name = input.name;
        const value = input.value[0]?.value;

        if (typeof value === "undefined" || typeof name === "undefined") {
            return;
        }

        extractedData[name] = value;
    });

    return {
        data: extractedData,
    };
};
