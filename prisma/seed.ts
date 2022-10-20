import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
const prisma = new PrismaClient();

const main = async () => {
    const hashedPassword = await hashPassword("123");

    await prisma.user.upsert({
        create: {
            id: "fsjapo12331248r923n",
            name: "Dawid Ol",
            email: "do@example.com",
            password: hashedPassword,
            image: "/dummy-image.jpg",
            created_at: new Date().toLocaleDateString(),
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
            image: "/dummy-image.jpg",
            created_at: new Date().toLocaleDateString(),
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
            image: "/dummy-image.jpg",
            created_at: new Date().toLocaleDateString(),
        },
        update: {},
        where: { email: "itachiU@sharingan.com" },
    });
};

main();
