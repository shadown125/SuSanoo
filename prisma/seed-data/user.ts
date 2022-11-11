import { hashPassword } from "../../lib/auth";
import { PrismaClient } from "@prisma/client";

export const users = async (prisma: PrismaClient) => {
    const hashedPassword = await hashPassword("123");

    await prisma.user.upsert({
        create: {
            id: "fsjapo12331248r923n",
            name: "Dawid Ol",
            email: "do@example.com",
            password: hashedPassword,
            image: "/dummy-image.jpg",
            status: false,
        },
        update: {},
        where: { email: "do@example.com" },
    });

    await prisma.user.upsert({
        create: {
            id: "o1j23h12ijh4i2yu1g",
            name: "Chuck Norris",
            email: "chuckNoriss@gigachad.com",
            password: hashedPassword,
            image: "/dummy-image-4.jpg",
            status: false,
        },
        update: {},
        where: { email: "chuckNoriss@gigachad.com" },
    });

    await prisma.user.upsert({
        create: {
            id: "njou12iph3291h30123",
            name: "Itachi Uchiha",
            email: "itachiU@sharingan.com",
            password: hashedPassword,
            image: "/dummy-image-2.jpg",
            status: false,
        },
        update: {},
        where: { email: "itachiU@sharingan.com" },
    });

    await prisma.user.upsert({
        create: {
            id: "2313dfadfawdsfasfds",
            name: "Sasuke Uchiha",
            email: "sasuke@sharingan.com",
            password: hashedPassword,
            image: "/dummy-image.jpg",
            status: false,
        },
        update: {},
        where: { email: "sasuke@sharingan.com" },
    });

    await prisma.user.upsert({
        create: {
            id: "hfdaskljh1u8934ty81bkbd",
            name: "Anna Maria Wesołowska",
            email: "wesolowska@prawo.com",
            password: hashedPassword,
            image: "/dummy-image-3.jpg",
            status: false,
        },
        update: {},
        where: { email: "wesolowska@prawo.com" },
    });
};
