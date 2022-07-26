import { PrismaClient } from "@prisma/client";

export const selectOptions = async (prisma: PrismaClient) => {
    await prisma.selectOption.upsert({
        create: {
            id: "fsjapo12331248r923n21232134145215",
            name: "option-1",
            inputId: "ksjap231o3123n21232312",
        },
        update: {},
        where: { id: "fsjapo12331248r923n21232134145215" },
    });

    await prisma.selectOption.upsert({
        create: {
            id: "fsjapo12331248r923n21232134145215123",
            name: "option-2",
            inputId: "ksjap231o3123n21232312",
        },
        update: {},
        where: { id: "fsjapo12331248r923n21232134145215123" },
    });

    await prisma.selectOption.upsert({
        create: {
            id: "fsjapo12331248r923n21232134145215421235",
            name: "option-3",
            inputId: "ksjap231o3123n21232312",
        },
        update: {},
        where: { id: "fsjapo12331248r923n21232134145215421235" },
    });
};
