import { PrismaClient } from "@prisma/client";

export const inputs = async (prisma: PrismaClient) => {
    await prisma.input.upsert({
        create: {
            id: "fsjap231o3123n2123",
            name: "email",
            componentId: "fsjapo3123n2123",
            pageComponentId: "fsjapo3123n2123",
            type: "email",
        },
        update: {
            id: "fsjap231o3123n2123",
            name: "email",
            componentId: "fsjapo3123n2123",
            pageComponentId: "fsjapo3123n2123",
            type: "email",
        },
        where: { id: "fsjap231o3123n2123" },
    });

    await prisma.input.upsert({
        create: {
            id: "fsjap231o3123n2123233213214515123",
            name: "text-2",
            componentId: "fsjapo3123n2123",
            pageComponentId: "fsjapo3123n2123",
            type: "text",
            halfRow: true,
        },
        update: {
            id: "fsjap231o3123n2123233213214515123",
            name: "text-2",
            componentId: "fsjapo3123n2123",
            type: {
                set: "text",
            },
            halfRow: true,
        },
        where: { id: "fsjap231o3123n2123233213214515123" },
    });

    await prisma.input.upsert({
        create: {
            id: "fsjap231o3123n2123233213214515124233",
            name: "text-3",
            componentId: "fsjapo3123n2123",
            pageComponentId: "fsjapo3123n2123",
            type: "text",
            halfRow: true,
        },
        update: {
            id: "fsjap231o3123n2123233213214515124233",
            name: "text-3",
            componentId: "fsjapo3123n2123",
            type: {
                set: "text",
            },
            halfRow: true,
        },
        where: { id: "fsjap231o3123n2123233213214515124233" },
    });

    await prisma.input.upsert({
        create: {
            id: "6565",
            name: "text",
            type: "text",
            componentId: "0234u290qnjkfna",
            pageComponentId: "0234u290qnjkfna",
        },
        update: {},
        where: { id: "6565" },
    });

    await prisma.input.upsert({
        create: {
            id: "fsjap231o3123n212323",
            name: "textarea",
            componentId: "fsjapo3123n2123",
            pageComponentId: "fsjapo3123n2123",
            type: "textarea",
        },
        update: {
            id: "fsjap231o3123n212323",
            name: "textarea",
            componentId: "fsjapo3123n2123",
            type: {
                set: "textarea",
            },
        },
        where: { id: "fsjap231o3123n212323" },
    });

    await prisma.input.upsert({
        create: {
            id: "ksjap231o3123n2123231",
            name: "date",
            componentId: "fsjapo3123n2123",
            pageComponentId: "fsjapo3123n2123",
            type: "date",
        },
        update: {
            id: "ksjap231o3123n2123231",
            name: "date",
            componentId: "fsjapo3123n2123",
            type: {
                set: "date",
            },
        },
        where: { id: "ksjap231o3123n2123231" },
    });

    await prisma.input.upsert({
        create: {
            id: "ksjap231o3123n21232312",
            name: "select",
            componentId: "fsjapo3123n2123",
            pageComponentId: "fsjapo3123n2123",
            type: "select",
        },
        update: {
            id: "ksjap231o3123n21232312",
            name: "select",
            componentId: "fsjapo3123n2123",
            type: {
                set: "select",
            },
        },
        where: { id: "ksjap231o3123n21232312" },
    });
};
