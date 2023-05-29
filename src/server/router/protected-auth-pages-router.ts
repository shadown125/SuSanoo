import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

export const protectedAuthPageRouter = createProtectedRouter()
    .mutation("create", {
        input: z.object({
            name: z.string(),
            route: z.string(),
            components: z.array(z.string()),
            nestedPath: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { name, route, components, nestedPath } = input;
            const userId = ctx.session.user.id;

            if (!userId) {
                throw new Error("User not found");
            }

            const page = await ctx.prisma.page.create({
                data: {
                    authorId: userId,
                    name: name,
                    route: route,
                    nestedPath: nestedPath,
                },
            });

            return components.forEach(async (componentId) => {
                await ctx.prisma.page.update({
                    where: {
                        id: page.id,
                    },
                    data: {
                        availableComponents: {
                            connect: {
                                id: componentId,
                            },
                        },
                    },
                });
            });
        },
    })
    .query("get", {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.page.findMany();
        },
    })
    .query("getById", {
        input: z.object({
            id: z.string().nullish(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            if (!id) return null;

            return await ctx.prisma.page.findUnique({
                where: {
                    id,
                },
            });
        },
    })
    .query("getPageAvailableComponents", {
        input: z.object({
            id: z.string().nullish(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            if (!id) return null;

            return await ctx.prisma.component.findMany({
                where: {
                    availablePages: {
                        some: {
                            id: id,
                        },
                    },
                },
            });
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
    .mutation("updateCurrentPage", {
        input: z.object({
            id: z.string().nullish(),
            name: z.string(),
            route: z.string(),
            components: z.array(z.string()),
            nestedPath: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id, name, route, components, nestedPath } = input;

            if (!id) {
                throw new Error("Page not found");
            }

            await ctx.prisma.page.update({
                where: {
                    id: id,
                },
                data: {
                    name: name,
                    route: route,
                    nestedPath: nestedPath,
                },
            });

            await ctx.prisma.pageComponentsIndex.deleteMany({
                where: {
                    pageId: id,
                },
            });

            await ctx.prisma.page.update({
                where: {
                    id: id,
                },
                data: {
                    availableComponents: {
                        set: components.map((componentId) => ({
                            id: componentId,
                        })),
                    },
                },
            });

            return components.forEach(async (componentId, index) => {
                await ctx.prisma.pageComponentsIndex.create({
                    data: {
                        pageId: id,
                        componentId: componentId,
                        index: index,
                    },
                });
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
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { name, pageId } = input;

            const components = await ctx.prisma.pageComponent.findMany({
                where: {
                    pageId: pageId,
                },
                include: {
                    input: true,
                },
            });

            return components.sort((a, b) => {
                if (a.index || b.index) {
                    return a.index < b.index ? -1 : 1;
                }

                return 0;
            });
        },
    })
    .mutation("updatePageComponentsIndex", {
        input: z.object({
            id: z.string(),
            index: z.number(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id, index } = input;

            return await ctx.prisma.pageComponent.update({
                where: {
                    id: id,
                },
                data: {
                    index: index,
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
                    pageComponentId: inputId,
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

            const component = await ctx.prisma.pageComponent.findUnique({
                where: {
                    id: componentId,
                },
            });

            if (!component) {
                throw new Error("Component not found");
            }

            await ctx.prisma.pageComponent.delete({
                where: {
                    id: componentId,
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
    })
    .mutation("updateActiveState", {
        input: z.object({
            id: z.string(),
            active: z.boolean(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id, active } = input;

            return await ctx.prisma.page.update({
                where: {
                    id: id,
                },
                data: {
                    active: active,
                },
            });
        },
    })
    .mutation("delete", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            await ctx.prisma.page.delete({
                where: {
                    id: id,
                },
            });
        },
    });
