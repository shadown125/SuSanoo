import { PrismaClient } from "@prisma/client";
import { components } from "./seed-data/components";
import { inputs } from "./seed-data/inputs";
import { pages } from "./seed-data/pages";
import { users } from "./seed-data/user";
import { history } from "./seed-data/history";
import { selectOptions } from "./seed-data/select-options";
import { pageInputsValues } from "./seed-data/page-inputs-values";
import { pageComponentsIndex } from "./seed-data/page-components-index";
const prisma = new PrismaClient();

const main = async () => {
    await users(prisma);
    await history(prisma);
    await pages(prisma);
    await components(prisma);
    await inputs(prisma);
    await selectOptions(prisma);
    await pageInputsValues(prisma);
    await pageComponentsIndex(prisma);
};

main();
