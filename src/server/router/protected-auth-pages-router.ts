import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const protectedAuthPageRouter = createProtectedRouter()
    .query("get", {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.page.findMany();
        },
    })
    .query("getPageInputsValues", {
        input: z.object({
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId } = input;

            return await ctx.prisma.pageInputsValues.findMany({
                where: {
                    pageId: pageId,
                },
            });
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
                orderBy: {
                    changeAt: "desc",
                },
            });
        },
    })
    .mutation("setNewPageHistoryChangeLog", {
        input: z.object({
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId } = input;

            const userId = ctx.session.user.id;

            if (!userId) {
                throw new Error("User not found");
            }

            return await ctx.prisma.history.create({
                data: {
                    pageId: pageId,
                    userId: userId,
                },
            });
        },
    })
    .query("getCurrentPageComponents", {
        input: z.object({
            name: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { name } = input;

            return await ctx.prisma.component.findMany({
                where: {
                    page: {
                        some: {
                            name: name,
                        },
                    },
                },
                include: {
                    input: true,
                },
            });
        },
    })
    .mutation("setNewPageInputValue", {
        input: z.object({
            inputId: z.string(),
            value: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { inputId, value } = input;

            return await ctx.prisma.pageInputsValues.update({
                where: {
                    id: inputId,
                },
                data: {
                    value: value,
                },
            });
        },
    })
    .mutation("deletePageComponent", {
        input: z.object({
            pageId: z.string(),
            componentId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { componentId, pageId } = input;

            await ctx.prisma.page.update({
                where: {
                    id: pageId,
                },
                data: {
                    components: {
                        disconnect: {
                            id: componentId,
                        },
                    },
                },
            });

            await ctx.prisma.pageInputsValues.deleteMany({
                where: {
                    pageId: pageId,
                    input: {
                        componentId: componentId,
                    },
                },
            });
        },
    });
