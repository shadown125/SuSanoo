import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const protectedAuthInputsRouter = createProtectedRouter()
    .query("get", {
        input: z.object({
            componentId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { componentId } = input;

            return await ctx.prisma.input.findMany({
                where: {
                    componentId: componentId,
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

            return await ctx.prisma.selectOption.findMany({
                where: {
                    inputId: id,
                },
            });
        },
    });
