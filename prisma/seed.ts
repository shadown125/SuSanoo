import { PrismaClient } from "@prisma/client";
import { users } from "./seed-data/user";

const prisma = new PrismaClient();

const main = async () => {
  await users(prisma);
};

main();
