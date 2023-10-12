import { api } from "@/utils/api";
import { Languages } from "@prisma/client";

export const useSusInputs = ({
  pageComponentId,
  pageId,
  language,
}: {
  pageComponentId: string;
  pageId: string;
  language: string;
}) => {
  const { data } = api.publicInputs.get.useQuery({
    pageComponentId: pageComponentId,
    pageId: pageId,
  });

  let extractedData: Record<string, string> = {};
  let extractedComponentItems: Record<string, string>[] = [];

  data?.forEach((component) => {
    const name = component.input.name;
    const value = component.value.find(
      (value) =>
        value.language ===
        Languages[language.toUpperCase() as keyof typeof Languages],
    )?.value;

    if (typeof value === "undefined" || typeof name === "undefined") {
      return;
    }

    if (component.input.componentItemId && name && value) {
      extractedComponentItems.push({
        name: name,
        value: value,
      });

      return;
    }

    extractedData[name] = value;
  });

  return {
    data: extractedData,
    items: extractedComponentItems,
  };
};
