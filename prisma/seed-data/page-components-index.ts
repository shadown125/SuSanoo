import { PrismaClient } from "@prisma/client";

export const pageComponentsIndex = async (prisma: PrismaClient) => {
    await prisma.pageComponentsIndex.upsert({
        create: {
            id: "fsjapo12331248r923n2123fdsafett34",
            pageId: "fsjapo12331221348r923n",
            index: 0,
            componentId: "fsjapo3123n2123",
        },
        update: {
            id: "fsjapo12331248r923n2123fdsafett34",
            pageId: "fsjapo12331221348r923n",
            index: 0,
            componentId: "fsjapo3123n2123",
        },
        where: { id: "fsjapo12331248r923n2123fdsafett34" },
    });

    await prisma.pageComponentsIndex.upsert({
        create: {
            id: "fsjapo12331248r923n2123fds231afett34",
            pageId: "fsjapo12331221348r923n",
            index: 1,
            componentId: "0234u290qnjkfna",
        },
        update: {
            id: "fsjapo12331248r923n2123fds231afett34",
            pageId: "fsjapo12331221348r923n",
            index: 1,
            componentId: "0234u290qnjkfna",
        },
        where: { id: "fsjapo12331248r923n2123fds231afett34" },
    });

    await prisma.pageComponentsIndex.upsert({
        create: {
            id: "fsjapo12331248r923n2123fdsafett323131242313",
            pageId: "fsjapo12331221348r923n231",
            index: 0,
            componentId: "0234u290qnjkfna",
        },
        update: {
            id: "fsjapo12331248r923n2123fdsafett323131242313",
            pageId: "fsjapo12331221348r923n231",
            index: 0,
            componentId: "0234u290qnjkfna",
        },
        where: { id: "fsjapo12331248r923n2123fdsafett323131242313" },
    });
};
