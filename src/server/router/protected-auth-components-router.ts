import { z } from "zod";
import { createProtectedRouter } from "./protected-router";

export const protectedAuthComponentsRouter = createProtectedRouter()
    .query("get", {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.component.findMany({
                include: {
                    input: true,
                },
            });
        },
    })
    .query("getComponentFromHistory", {
        input: z.object({
            componentId: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.component.findUnique({
                where: {
                    id: input.componentId,
                },
            });
        },
    })
    .query("getCurrentComponentsHistory", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.history.findMany({
                where: {
                    componentId: input.id,
                },
                take: 20,
                orderBy: {
                    changeAt: "desc",
                },
            });
        },
    })
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
    .mutation("addNewHistoryChangeLog", {
        input: z.object({
            componentId: z.string(),
        }),
        resolve: ({ ctx, input }) => {
            const { componentId } = input;

            const userId = ctx.session.user.id;

            if (!componentId) {
                throw new Error("Component not found");
            }

            if (!userId) {
                throw new Error("User not found");
            }

            return ctx.prisma.history.create({
                data: {
                    componentId: componentId,
                    userId: userId,
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
