import { PrismaClient } from "@prisma/client";
import { components } from "./seed-data/components";
import { inputs } from "./seed-data/inputs";
import { pages } from "./seed-data/pages";
import { users } from "./seed-data/user";
import { history } from "./seed-data/history";
const prisma = new PrismaClient();

const main = async () => {
    await users(prisma);
    await history(prisma);
    await pages(prisma);
    await inputs(prisma);
    await components(prisma);
};

main();
