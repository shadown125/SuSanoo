import { z } from "zod";
import { createRouter } from "./context";

export const publicInputsRouter = createRouter()
    .query("get", {
        input: z.object({
            pageComponentId: z.string(),
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageComponentId, pageId } = input;

            return await ctx.prisma.pageInputsValues.findMany({
                where: {
                    pageId: pageId,
                    pageComponentId: pageComponentId,
                },
                include: {
                    input: true,
                    value: true,
                },
            });
        },
    })
    .query("getPageInput", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            return await ctx.prisma.pageInputsValues.findUnique({
                where: {
                    id,
                },
            });
        },
    });
