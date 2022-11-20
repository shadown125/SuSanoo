import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const protectedAuthInputsRouter = createProtectedRouter()
    .query("get", {
        input: z.object({
            componentId: z.string(),
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { componentId, pageId } = input;

            return await ctx.prisma.input.findMany({
                where: {
                    componentId: componentId,
                },
                include: {
                    value: {
                        where: {
                            pageId: pageId,
                        },
                        select: {
                            id: true,
                        },
                    },
                },
            });
        },
    })
    .query("getSelectOptions", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            if (id === "") {
                return null;
            }

            return await ctx.prisma.selectOption.findMany({
                where: {
                    inputId: id,
                },
            });
        },
    });
