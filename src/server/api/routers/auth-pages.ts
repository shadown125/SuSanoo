import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Languages } from "@prisma/client";
import uuid from "react-uuid";
import { z } from "zod";

export const authPages = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        route: z.string(),
        components: z.array(z.string()),
        nestedPath: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, route, components, nestedPath } = input;
      const userId = ctx.session.user.id;

      if (!userId) {
        throw new Error("User not found");
      }

      const page = await ctx.db.page.create({
        data: {
          authorId: userId,
          name: name,
          route: route,
          nestedPath: nestedPath,
        },
      });

      await ctx.db.pageSeo.create({
        data: {
          title: name,
          pageId: page.id,
          language: Languages.EN,
        },
      });

      await ctx.db.pageLanguages.create({
        data: {
          pageId: page.id,
        },
      });

      return components.forEach((componentId) => {
        void ctx.db.page.update({
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
    }),

  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.page.findMany();
  }),

  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      if (!id) return null;

      return await ctx.db.page.findUnique({
        where: {
          id,
        },
        include: {
          pageLanguages: true,
          pageSeo: true,
        },
      });
    }),

  getPageAvailableComponents: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      if (!id) return null;

      return await ctx.db.component.findMany({
        where: {
          availablePages: {
            some: {
              id: id,
            },
          },
        },
      });
    }),

  getPageInputsValues: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { pageId } = input;

      return await ctx.db.pageInputsValues.findMany({
        where: {
          pageId: pageId,
        },
      });
    }),

  getPageFromHistory: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { pageId } = input;

      return await ctx.db.page.findUnique({
        where: {
          id: pageId,
        },
      });
    }),

  getCurrentPageHistory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      return await ctx.db.history.findMany({
        where: {
          pageId: id,
        },
        take: 20,
        orderBy: {
          changeAt: "desc",
        },
      });
    }),

  addLanguageToCurrentPage: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pageId, language } = input;

      const currentPage = await ctx.db.page.findUnique({
        where: {
          id: pageId,
        },
      });

      if (!currentPage) throw new Error("Page not found");

      const pageInputsValues = await ctx.db.pageInputsValues.findMany({
        where: {
          pageId: pageId,
        },
        include: {
          value: true,
        },
      });

      pageInputsValues.forEach((pageInputValue) => {
        void ctx.db.pageInputsValuesBasedOnLanguage.create({
          data: {
            pageInputsValuesId: pageInputValue.id,
            language: language,
            value: "",
          },
        });
      });

      await ctx.db.pageSeo.create({
        data: {
          title: currentPage.name,
          pageId: pageId,
          language: language,
        },
      });

      return await ctx.db.pageLanguages.create({
        data: {
          pageId: pageId,
          language: language,
        },
      });
    }),

  deleteLanguageFromCurrentPage: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pageId, language } = input;

      const pageInputsValues = await ctx.db.pageInputsValues.findMany({
        where: {
          pageId: pageId,
        },
        include: {
          value: true,
        },
      });

      pageInputsValues.forEach((pageInputValue) => {
        void ctx.db.pageInputsValuesBasedOnLanguage.deleteMany({
          where: {
            pageInputsValuesId: pageInputValue.id,
            language: language,
          },
        });
      });

      const page = await ctx.db.page.findUnique({
        where: {
          id: pageId,
        },
        include: {
          pageLanguages: true,
          pageSeo: true,
        },
      });

      const currentPageLanguage = page?.pageLanguages.find(
        (pageLanguage) => pageLanguage.language === language,
      );
      const currentSeoLanguagePage = page?.pageSeo.find(
        (pageSeo) => pageSeo.language === language,
      );

      if (!currentPageLanguage) {
        throw new Error("Page language not found");
      }

      await ctx.db.pageSeo.delete({
        where: {
          id: currentSeoLanguagePage?.id,
        },
      });

      await ctx.db.pageLanguages.delete({
        where: {
          id: currentPageLanguage.id,
        },
      });
    }),

  getCurrentPageLanguages: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { pageId } = input;

      return await ctx.db.pageLanguages.findMany({
        where: {
          pageId: pageId,
        },
      });
    }),

  updateCurrentPage: protectedProcedure
    .input(
      z.object({
        id: z.string().nullish(),
        name: z.string(),
        route: z.string(),
        components: z.array(z.string()),
        nestedPath: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, route, components, nestedPath } = input;
      let routeName = route;

      if (!id) {
        throw new Error("Page not found");
      }

      const currentPage = await ctx.db.page.findUnique({
        where: {
          id: id,
        },
      });

      if (currentPage?.route === "/") {
        routeName = "/";
      }

      await ctx.db.page.update({
        where: {
          id: id,
        },
        data: {
          name: name,
          route: routeName,
          nestedPath: nestedPath,
        },
      });
      await ctx.db.page.update({
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
    }),

  setNewPageHistoryChangeLog: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pageId } = input;

      const userId = ctx.session.user.id;

      if (!userId) {
        throw new Error("User not found");
      }

      return await ctx.db.history.create({
        data: {
          pageId: pageId,
          userId: userId,
        },
      });
    }),

  getPageComponentItemById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      return await ctx.db.pageComponentsItem.findUnique({
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
    }),

  createPageComponentItem: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        name: z.string(),
        componentId: z.string(),
        pageComponentData: z.record(z.string(), z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pageId, name, componentId, pageComponentData } = input;

      const page = await ctx.db.page.findUnique({
        where: {
          id: pageId,
        },
        include: {
          pageLanguages: true,
        },
      });

      const pageComponent = await ctx.db.pageComponent.findUnique({
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

      const pageComponentItem = await ctx.db.pageComponentsItem.create({
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
        pageComponent.componentItems.inputs.map(async (input) => {
          if (
            input.componentItemId === pageComponent.componentItemsId &&
            input.id === key
          ) {
            const uniqueId = uuid();

            const pageInputsValue = await ctx.db.pageInputsValues.create({
              data: {
                pageId: pageId,
                inputId: input.id,
                pageComponentId: pageComponent.id,
                pageComponentItemsInputId: uniqueId,
                pageComponentItemsId: pageComponentItem.id,
              },
            });

            page.pageLanguages.map(async (pageLanguage) => {
              await ctx.db.pageInputsValuesBasedOnLanguage.create({
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
    }),

  getCurrentPageComponents: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        pageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { pageId } = input;

      const components = await ctx.db.pageComponent.findMany({
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
    }),

  updatePageComponentsIndex: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        index: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, index } = input;

      return await ctx.db.pageComponent.update({
        where: {
          id: id,
        },
        data: {
          index: index,
        },
      });
    }),

  createPageSeo: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pageId, language, title } = input;

      return await ctx.db.pageSeo.create({
        data: {
          title: title,
          pageId: pageId,
          language: language,
        },
      });
    }),

  getPageSeo: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { pageId, language } = input;

      const pageSeos = await ctx.db.pageSeo.findMany({
        where: {
          pageId: pageId,
        },
      });

      return pageSeos.find((pageSeo) => pageSeo.language === language);
    }),

  updatePageSeo: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
        title: z.string(),
        favicon: z.string().optional(),
        description: z.string().optional(),
        author: z.string().optional(),
        twitterAuthor: z.string().optional(),
        twitterSite: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        pageId,
        language,
        title,
        favicon,
        description,
        author,
        twitterAuthor,
        twitterSite,
      } = input;

      const currentPage = await ctx.db.page.findUnique({
        where: {
          id: pageId,
        },
        include: {
          pageSeo: true,
        },
      });

      return currentPage?.pageSeo.map(async (pageSeo) => {
        if (pageSeo.language === language) {
          await ctx.db.pageSeo.update({
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
    }),

  setNewPageInputValue: protectedProcedure
    .input(
      z.object({
        inputId: z.string(),
        value: z.string(),
        language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { inputId, value, language } = input;

      const inputValue = await ctx.db.pageInputsValues.findUnique({
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

      const pageInputLanguageValue = inputValue.value.find(
        (pageInputValue) =>
          pageInputValue.language === language &&
          pageInputValue.pageInputsValuesId === inputValue.id,
      );

      if (!pageInputLanguageValue) {
        throw new Error("Page input language value not found");
      }

      return await ctx.db.pageInputsValuesBasedOnLanguage.update({
        where: {
          id: pageInputLanguageValue.id,
        },
        data: {
          value: value,
        },
      });
    }),

  deletePageComponent: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
        componentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { componentId, pageId } = input;

      const component = await ctx.db.pageComponent.findUnique({
        where: {
          id: componentId,
        },
      });

      if (!component) {
        throw new Error("Component not found");
      }

      await ctx.db.pageComponent.delete({
        where: {
          id: componentId,
        },
      });

      await ctx.db.pageInputsValues.deleteMany({
        where: {
          pageId: pageId,
          input: {
            componentId: componentId,
          },
        },
      });
    }),

  deletePageComponentItem: protectedProcedure
    .input(
      z.object({
        pageComponentItemId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { pageComponentItemId } = input;

      const pageComponentItem = await ctx.db.pageComponentsItem.findUnique({
        where: {
          id: pageComponentItemId,
        },
      });

      if (!pageComponentItem) throw new Error("Page component item not found");

      await ctx.db.pageComponentsItem.delete({
        where: {
          id: pageComponentItemId,
        },
      });

      await ctx.db.pageInputsValues.deleteMany({
        where: {
          pageComponentItemsId: pageComponentItemId,
        },
      });
    }),

  updateActiveState: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        active: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, active } = input;

      return await ctx.db.page.update({
        where: {
          id: id,
        },
        data: {
          active: active,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      await ctx.db.page.delete({
        where: {
          id: id,
        },
      });
    }),
});
