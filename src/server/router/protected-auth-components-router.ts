import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const protectedAuthComponentsRouter = createProtectedRouter()
    .query("getAvaibleComponents", {
        input: z.object({
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId } = input;

            return await ctx.prisma.component.findMany({
                where: {
                    page: {
                        none: {
                            id: pageId,
                        },
                    },
                },
            });
        },
    })
    .mutation("addToCurrentPage", {
        input: z.object({
            componentId: z.string(),
            pageId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            const { componentId, pageId } = input;

            const component = await ctx.prisma.component.findUnique({
                where: {
                    id: componentId,
                },
                include: {
                    input: true,
                },
            });

            if (!component) {
                throw new Error("Component not found");
            }

            component.input.forEach(async (input) => {
                await ctx.prisma.pageInputsValues.create({
                    data: {
                        pageId: pageId,
                        inputId: input.id,
                        value: "",
                    },
                });
            });

            await ctx.prisma.page.update({
                where: {
                    id: pageId,
                },
                data: {
                    components: {
                        connect: {
                            id: component.id,
                        },
                    },
                },
            });

            return component;
        },
    });
