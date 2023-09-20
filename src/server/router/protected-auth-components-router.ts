import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import { Languages } from "@prisma/client";

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
    .query("getPageComponentById", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ ctx, input }) => {
            return await ctx.prisma.pageComponent.findUnique({
                where: {
                    id: input.id,
                },
                include: {
                    input: true,
                    componentItems: {
                        include: {
                            inputs: true,
                        },
                    },
                },
            });
        },
    })
    .mutation("create", {
        input: z.object({
            componentName: z.string(),
            key: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { componentName, key } = input;

            const userId = ctx.session.user.id;

            if (!userId) {
                throw new Error("User not found");
            }

            const components = await ctx.prisma.component.findMany();

            const component = components.find((component) => component.name === componentName);

            if (component) {
                throw new Error("Component already exists");
            }

            const componentItems = await ctx.prisma.componentItems.create({
                data: {},
            });

            return await ctx.prisma.component.create({
                data: {
                    name: componentName,
                    key: key,
                    componentItemsId: componentItems.id,
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

            const userId = ctx.session.user.id;

            if (!userId) {
                throw new Error("User not found");
            }

            const component = await ctx.prisma.component.findUnique({
                where: {
                    id: id,
                },
            });

            if (!component) {
                throw new Error("Component not found");
            }

            return await ctx.prisma.component.delete({
                where: {
                    id: id,
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
                    availablePages: {
                        some: {
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
            language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
        }),
        resolve: async ({ ctx, input }) => {
            const { componentId, pageId, language } = input;

            const component = await ctx.prisma.component.findUnique({
                where: {
                    id: componentId,
                },
                include: {
                    input: true,
                },
            });

            const page = await ctx.prisma.page.findUnique({
                where: {
                    id: pageId,
                },
                include: {
                    pageLanguages: true,
                },
            });

            const pageComponents = await ctx.prisma.pageComponent.findMany({
                where: {
                    pageId: pageId,
                },
            });

            if (!component) {
                throw new Error("Component not found");
            }

            if (!page) {
                throw new Error("Page not found");
            }

            if (!pageComponents) {
                throw new Error("Page components not found");
            }

            const newPageComponent = await ctx.prisma.pageComponent.create({
                data: {
                    pageId: pageId,
                    name: component.name,
                    componentId: componentId,
                    index: pageComponents.length,
                    componentItemsId: component.componentItemsId,
                    key: component.key,
                },
            });

            component.input.forEach(async (input) => {
                if (!input.componentItemId) {
                    await ctx.prisma.pageInputsValues.create({
                        data: {
                            pageId: pageId,
                            inputId: input.id,
                            pageComponentId: newPageComponent.id,
                        },
                    });
                }
            });

            await ctx.prisma.pageComponent.update({
                where: {
                    id: newPageComponent.id,
                },
                data: {
                    input: {
                        connect: component.input.map((input) => {
                            return {
                                id: input.id,
                            };
                        }),
                    },
                },
            });

            const pageInputsValues = await ctx.prisma.pageInputsValues.findMany({
                where: {
                    pageComponentId: newPageComponent.id,
                },
            });

            if (!pageInputsValues) {
                throw new Error("Page inputs values not found");
            }

            pageInputsValues.forEach(async (pageInputValue) => {
                page.pageLanguages.forEach(async (pageLanguage) => {
                    await ctx.prisma.pageInputsValuesBasedOnLanguage.create({
                        data: {
                            pageInputsValuesId: pageInputValue.id,
                            language: pageLanguage.language,
                            value: "",
                        },
                    });
                });
            });

            return newPageComponent;
        },
    });
