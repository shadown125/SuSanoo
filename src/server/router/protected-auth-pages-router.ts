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
    });
