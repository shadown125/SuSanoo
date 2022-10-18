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
        },
        update: {},
        where: { email: "do@example.com" },
    });
};

main();
