import { PrismaClient } from "@prisma/client";

export const pageInputsValues = async (prisma: PrismaClient) => {
    await prisma.pageInputsValues.upsert({
        create: {
            id: "31255",
            pageId: "fsjapo12331221348r923n231",
            inputId: "fsjap231o3123n2123",
            value: "This should be value text for input Email",
        },
        update: {},
        where: { id: "31255" },
    });

    await prisma.pageInputsValues.upsert({
        create: {
            id: "21341123",
            pageId: "fsjapo12331221348r923n",
            inputId: "fsjap231o3123n2123233213214515123",
            value: "This should be value text for input text-2",
        },
        update: {},
        where: { id: "21341123" },
    });

    await prisma.pageInputsValues.upsert({
        create: {
            id: "314hnjfd",
            pageId: "fsjapo12331221348r923n",
            inputId: "fsjap231o3123n212323",
            value: "This should be value text for input TextArea",
        },
        update: {},
        where: { id: "314hnjfd" },
    });

    await prisma.pageInputsValues.upsert({
        create: {
            id: "314hnjf231d",
            pageId: "fsjapo12331221348r923n",
            inputId: "fsjap231o3123n2123233213214515124233",
            value: "This should be value text for input text-3",
        },
        update: {},
        where: { id: "314hnjf231d" },
    });

    await prisma.pageInputsValues.upsert({
        create: {
            id: "314hnjf231d231",
            pageId: "fsjapo12331221348r923n",
            inputId: "6565",
            value: "This should be value text for input text in section component",
        },
        update: {},
        where: { id: "314hnjf231d231" },
    });

    await prisma.pageInputsValues.upsert({
        create: {
            id: "2315flsadfhlkju9",
            pageId: "fsjapo12331221348r923n",
            inputId: "ksjap231o3123n2123231",
            value: "2021-01-20",
        },
        update: {
            id: "2315flsadfhlkju9",
            pageId: "fsjapo12331221348r923n",
            inputId: "ksjap231o3123n2123231",
            value: "2021-01-20",
        },
        where: { id: "2315flsadfhlkju9" },
    });

    await prisma.pageInputsValues.upsert({
        create: {
            id: "2315flsadfhlkju91232141254",
            pageId: "fsjapo12331221348r923n",
            inputId: "ksjap231o3123n21232312",
            value: "option-2",
        },
        update: {
            id: "2315flsadfhlkju91232141254",
            pageId: "fsjapo12331221348r923n",
            inputId: "ksjap231o3123n21232312",
            value: "option-2",
        },
        where: { id: "2315flsadfhlkju91232141254" },
    });
};
