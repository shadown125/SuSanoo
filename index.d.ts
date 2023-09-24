import { PrismaClient } from "@prisma/client";
import * as trpcNext from "@trpc/server/adapters/next";

export function createContext(opts?: trpcNext.CreateNextContextOptions): Promise<Context>;

export * from ".prisma/client/index.d";

export interface Context {
    prisma: PrismaClient;
}
