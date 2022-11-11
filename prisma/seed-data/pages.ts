import { PrismaClient } from "@prisma/client";

export const pages = async (prisma: PrismaClient) => {
    await prisma.page.upsert({
        create: {
            id: "fsjapo12331221348r923n",
            name: "Home",
            authorId: "fsjapo12331248r923n",
        },
        update: {},
        where: { id: "fsjapo12331221348r923n" },
    });

    await prisma.page.upsert({
        create: {
            id: "fsjapo12331221348r923n231",
            name: "Subpage",
            authorId: "o1j23h12ijh4i2yu1g",
            active: false,
        },
        update: {},
        where: { id: "fsjapo12331221348r923n231" },
    });
};
