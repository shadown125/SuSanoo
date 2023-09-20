import { Languages } from "@prisma/client";
import { createProtectedRouter } from "./protected-router";
import { z } from "zod";
import uuid from "react-uuid";

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

            await ctx.prisma.pageSeo.create({
                data: {
                    title: name,
                    pageId: page.id,
                    language: Languages.EN,
                },
            });

            await ctx.prisma.pageLanguages.create({
                data: {
                    pageId: page.id,
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
                include: {
                    pageLanguages: true,
                    pageSeo: true,
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
    .mutation("addLanguageToCurrentPage", {
        input: z.object({
            pageId: z.string(),
            language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId, language } = input;

            const currentPage = await ctx.prisma.page.findUnique({
                where: {
                    id: pageId,
                },
            });

            if (!currentPage) throw new Error("Page not found");

            const pageInputsValues = await ctx.prisma.pageInputsValues.findMany({
                where: {
                    pageId: pageId,
                },
                include: {
                    value: true,
                },
            });

            pageInputsValues.forEach(async (pageInputValue) => {
                await ctx.prisma.pageInputsValuesBasedOnLanguage.create({
                    data: {
                        pageInputsValuesId: pageInputValue.id,
                        language: language,
                        value: "",
                    },
                });
            });

            await ctx.prisma.pageSeo.create({
                data: {
                    title: currentPage.name,
                    pageId: pageId,
                    language: language,
                },
            });

            return await ctx.prisma.pageLanguages.create({
                data: {
                    pageId: pageId,
                    language: language,
                },
            });
        },
    })
    .mutation("deleteLanguageFromCurrentPage", {
        input: z.object({
            pageId: z.string(),
            language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId, language } = input;

            const pageInputsValues = await ctx.prisma.pageInputsValues.findMany({
                where: {
                    pageId: pageId,
                },
                include: {
                    value: true,
                },
            });

            pageInputsValues.forEach(async (pageInputValue) => {
                await ctx.prisma.pageInputsValuesBasedOnLanguage.deleteMany({
                    where: {
                        pageInputsValuesId: pageInputValue.id,
                        language: language,
                    },
                });
            });

            const page = await ctx.prisma.page.findUnique({
                where: {
                    id: pageId,
                },
                include: {
                    pageLanguages: true,
                    pageSeo: true,
                },
            });

            const currentPageLanguage = page?.pageLanguages.find((pageLanguage) => pageLanguage.language === language);
            const currentSeoLanguagePage = page?.pageSeo.find((pageSeo) => pageSeo.language === language);

            if (!currentPageLanguage) {
                throw new Error("Page language not found");
            }

            await ctx.prisma.pageSeo.delete({
                where: {
                    id: currentSeoLanguagePage?.id,
                },
            });

            await ctx.prisma.pageLanguages.delete({
                where: {
                    id: currentPageLanguage.id,
                },
            });
        },
    })
    .query("getCurrentPageLanguages", {
        input: z.object({
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId } = input;

            return await ctx.prisma.pageLanguages.findMany({
                where: {
                    pageId: pageId,
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
            let routeName = route;

            if (!id) {
                throw new Error("Page not found");
            }

            const currentPage = await ctx.prisma.page.findUnique({
                where: {
                    id: id,
                },
            });

            if (currentPage?.route === "/") {
                routeName = "/";
            }

            await ctx.prisma.page.update({
                where: {
                    id: id,
                },
                data: {
                    name: name,
                    route: routeName,
                    nestedPath: nestedPath,
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
    .query("getPageComponentItemById", {
        input: z.object({
            id: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { id } = input;

            return await ctx.prisma.pageComponentsItem.findUnique({
                where: {
                    id: id,
                },
                include: {
                    inputs: {
                        include: {
                            value: {
                                include: {
                                    value: true,
                                },
                            },
                        },
                    },
                },
            });
        },
    })
    .mutation("createPageComponentItem", {
        input: z.object({
            pageId: z.string(),
            name: z.string(),
            componentId: z.string(),
            pageComponentData: z.record(z.string(), z.string()),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId, name, componentId, pageComponentData } = input;

            const page = await ctx.prisma.page.findUnique({
                where: {
                    id: pageId,
                },
                include: {
                    pageLanguages: true,
                },
            });

            const pageComponent = await ctx.prisma.pageComponent.findUnique({
                where: {
                    id: componentId,
                },
                include: {
                    componentItems: {
                        include: {
                            inputs: true,
                        },
                    },
                },
            });

            if (!pageComponent) {
                throw new Error("Page component not found");
            }

            if (!page) {
                throw new Error("Page not found");
            }

            const pageComponentItem = await ctx.prisma.pageComponentsItem.create({
                data: {
                    name: name,
                    pageComponentId: pageComponent.id,
                    inputs: {
                        connect: pageComponent.componentItems.inputs.map((input) => ({
                            id: input.id,
                        })),
                    },
                },
            });

            for (const [key, value] of Object.entries(pageComponentData)) {
                pageComponent.componentItems.inputs.forEach(async (input) => {
                    if (input.componentItemId === pageComponent.componentItemsId && input.id === key) {
                        const uniqueId = uuid();

                        const pageInputsValue = await ctx.prisma.pageInputsValues.create({
                            data: {
                                pageId: pageId,
                                inputId: input.id,
                                pageComponentId: pageComponent.id,
                                pageComponentItemsInputId: uniqueId,
                                pageComponentItemsId: pageComponentItem.id,
                            },
                        });

                        page.pageLanguages.forEach(async (pageLanguage) => {
                            await ctx.prisma.pageInputsValuesBasedOnLanguage.create({
                                data: {
                                    pageInputsValuesId: pageInputsValue.id,
                                    language: pageLanguage.language,
                                    value: value,
                                },
                            });
                        });
                    }
                });
            }

            // const pageInputsValues = await ctx.prisma.pageInputsValues.findMany({
            //     where: {
            //         pageComponentId: pageComponent.id,
            //     },
            //     include: {
            //         input: true,
            //     },
            // });

            // if (!pageInputsValues) {
            //     throw new Error("Page inputs values not found");
            // }

            // for (const [key, value] of Object.entries(pageComponentData)) {
            //     if (key !== "") {
            //         pageInputsValues.forEach(async (pageInputValue) => {
            //             if (pageInputValue.pageComponentItemsInputId === key) {
            //                 page.pageLanguages.forEach(async (pageLanguage) => {
            //                     await ctx.prisma.pageInputsValuesBasedOnLanguage.create({
            //                         data: {
            //                             pageInputsValuesId: pageInputValue.id,
            //                             language: pageLanguage.language,
            //                             value: value,
            //                         },
            //                     });
            //                 });
            //             }
            //         });
            //     }
            // }
        },
    })
    .query("getCurrentPageComponents", {
        input: z.object({
            name: z.string(),
            pageId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId } = input;

            const components = await ctx.prisma.pageComponent.findMany({
                where: {
                    pageId: pageId,
                },
                include: {
                    componentItems: {
                        include: {
                            inputs: true,
                        },
                    },
                    pageComponentsItem: true,
                    input: {
                        include: {
                            value: true,
                        },
                    },
                    PageInputsValues: {
                        include: {
                            value: true,
                        },
                    },
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
    .mutation("createPageSeo", {
        input: z.object({
            pageId: z.string(),
            language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
            title: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId, language, title } = input;

            return await ctx.prisma.pageSeo.create({
                data: {
                    title: title,
                    pageId: pageId,
                    language: language,
                },
            });
        },
    })
    .query("getPageSeo", {
        input: z.object({
            pageId: z.string(),
            language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId, language } = input;

            const pageSeos = await ctx.prisma.pageSeo.findMany({
                where: {
                    pageId: pageId,
                },
            });

            return pageSeos.find((pageSeo) => pageSeo.language === language);
        },
    })
    .mutation("updatePageSeo", {
        input: z.object({
            pageId: z.string(),
            language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
            title: z.string(),
            favicon: z.string().optional(),
            description: z.string().optional(),
            author: z.string().optional(),
            twitterAuthor: z.string().optional(),
            twitterSite: z.string().optional(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageId, language, title, favicon, description, author, twitterAuthor, twitterSite } = input;

            const currentPage = await ctx.prisma.page.findUnique({
                where: {
                    id: pageId,
                },
                include: {
                    pageSeo: true,
                },
            });

            return currentPage?.pageSeo.forEach(async (pageSeo) => {
                if (pageSeo.language === language) {
                    await ctx.prisma.pageSeo.update({
                        where: {
                            id: pageSeo.id,
                        },
                        data: {
                            title,
                            favicon,
                            author,
                            description,
                            twitterAuthor,
                            twitterSite,
                        },
                    });
                }
            });
        },
    })
    .mutation("setNewPageInputValue", {
        input: z.object({
            inputId: z.string(),
            value: z.string(),
            language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
        }),
        resolve: async ({ input, ctx }) => {
            const { inputId, value, language } = input;

            const inputValue = await ctx.prisma.pageInputsValues.findUnique({
                where: {
                    id: inputId,
                },
                include: {
                    value: true,
                },
            });

            if (!inputValue) {
                throw new Error("Input value not found");
            }

            const pageInputLanguageValue = inputValue.value.find((pageInputValue) => pageInputValue.language === language && pageInputValue.pageInputsValuesId === inputValue.id);

            if (!pageInputLanguageValue) {
                throw new Error("Page input language value not found");
            }

            return await ctx.prisma.pageInputsValuesBasedOnLanguage.update({
                where: {
                    id: pageInputLanguageValue.id,
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
    .mutation("deletePageComponentItem", {
        input: z.object({
            pageComponentItemId: z.string(),
        }),
        resolve: async ({ input, ctx }) => {
            const { pageComponentItemId } = input;

            const pageComponentItem = await ctx.prisma.pageComponentsItem.findUnique({
                where: {
                    id: pageComponentItemId,
                },
            });

            if (!pageComponentItem) throw new Error("Page component item not found");

            await ctx.prisma.pageComponentsItem.delete({
                where: {
                    id: pageComponentItemId,
                },
            });

            await ctx.prisma.pageInputsValues.deleteMany({
                where: {
                    pageComponentItemsId: pageComponentItemId,
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
