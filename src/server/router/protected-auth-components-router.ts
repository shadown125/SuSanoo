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
                    PageComponentsIndex: true,
                },
            });

            const page = await ctx.prisma.page.findUnique({
                where: {
                    id: pageId,
                },
                include: {
                    PageComponentsIndex: true,
                },
            });

            if (!component) {
                throw new Error("Component not found");
            }

            if (!page) {
                throw new Error("Page not found");
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

            console.log(component.PageComponentsIndex.length);

            await ctx.prisma.pageComponentsIndex.create({
                data: {
                    pageId: pageId,
                    componentId: componentId,
                    index: page.PageComponentsIndex.length,
                },
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
