import { PrismaClient } from "@prisma/client";

export const history = async (prisma: PrismaClient) => {
    await prisma.history.upsert({
        create: {
            id: "fsjapo12331248r923n2123",
            userId: "fsjapo12331248r923n",
            pageId: "fsjapo12331221348r923n231",
        },
        update: {},
        where: { id: "fsjapo12331248r923n2123" },
    });

    await prisma.history.upsert({
        create: {
            id: "fsjapo12331248r923323n2123",
            userId: "o1j23h12ijh4i2yu1g",
            pageId: "fsjapo12331221348r923n",
        },
        update: {},
        where: { id: "fsjapo12331248r923323n2123" },
    });

    await prisma.history.upsert({
        create: {
            id: "fsjapo12331248r923323n212",
            userId: "o1j23h12ijh4i2yu1g",
            pageId: "fsjapo12331221348r923n",
        },
        update: {},
        where: { id: "fsjapo12331248r923323n212" },
    });

    await prisma.history.upsert({
        create: {
            id: "fsjapo12331248r923323n321321212",
            userId: "o1j23h12ijh4i2yu1g",
            componentId: "fsjapo3123n2123",
        },
        update: {},
        where: { id: "fsjapo12331248r923323n321321212" },
    });

    await prisma.history.upsert({
        create: {
            id: "fsjapo12331248r923123213323n321321212",
            userId: "o1j23h12ijh4i2yu1g",
            componentId: "0234u290qnjkfna",
        },
        update: {},
        where: { id: "fsjapo12331248r923123213323n321321212" },
    });
};
