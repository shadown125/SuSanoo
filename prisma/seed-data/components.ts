import { PrismaClient } from "@prisma/client";

export const components = async (prisma: PrismaClient) => {
    await prisma.component.upsert({
        create: {
            id: "fsjapo3123n2123",
            name: "Header",
            page: {
                connect: { id: "fsjapo12331221348r923n" },
            },
        },
        update: {
            id: "fsjapo3123n2123",
            name: "Header",
            page: {
                connect: { id: "fsjapo12331221348r923n" },
            },
        },
        where: { id: "fsjapo3123n2123" },
    });

    await prisma.component.upsert({
        create: {
            id: "0234u290qnjkfna",
            name: "section-1",
            page: {
                connect: [{ id: "fsjapo12331221348r923n231" }, { id: "fsjapo12331221348r923n" }],
            },
        },
        update: {
            id: "0234u290qnjkfna",
            name: "section-1",
            page: {
                connect: [{ id: "fsjapo12331221348r923n231" }, { id: "fsjapo12331221348r923n" }],
            },
        },
        where: { id: "0234u290qnjkfna" },
    });
};
