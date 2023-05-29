import { PrismaClient } from "@prisma/client";

export const components = async (prisma: PrismaClient) => {
    await prisma.component.upsert({
        create: {
            id: "fsjapo3123n2123",
            name: "Header",
        },
        update: {
            id: "fsjapo3123n2123",
            name: "Header",
        },
        where: { id: "fsjapo3123n2123" },
    });

    await prisma.component.upsert({
        create: {
            id: "0234u290qnjkfna",
            name: "section-1",
        },
        update: {
            id: "0234u290qnjkfna",
            name: "section-1",
        },
        where: { id: "0234u290qnjkfna" },
    });
};
