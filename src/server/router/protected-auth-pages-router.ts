import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const protectedAuthPageRouter = createProtectedRouter()
    .query("get", {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.page.findMany();
        },
    })
    .query("getPageFromHistory", {
        input: z.object({
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId } = input;

            return await ctx.prisma.page.findUnique({
                where: {
                    id: pageId,
                },
            });
        },
    })
    .query("getCurrentPageHistory", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            return await ctx.prisma.history.findMany({
                where: {
                    pageId: id,
                },
                take: 20,
            });
        },
    });
