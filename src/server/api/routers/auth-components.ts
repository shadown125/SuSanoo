import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { Languages } from "@prisma/client";
import { z } from "zod";

export const authComponents = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.component.findMany({
      include: {
        input: true,
      },
    });
  }),

  getPageComponentById: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.pageComponent.findUnique({
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
    }),

  create: protectedProcedure
    .input(
      z.object({
        componentName: z.string(),
        key: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { componentName, key } = input;

      const userId = ctx.session.user.id;

      if (!userId) {
        throw new Error("User not found");
      }

      const components = await ctx.db.component.findMany();

      const component = components.find(
        (component) => component.name === componentName,
      );

      if (component) {
        throw new Error("Component already exists");
      }

      const componentItems = await ctx.db.componentItems.create({
        data: {},
      });

      return await ctx.db.component.create({
        data: {
          name: componentName,
          key: key,
          componentItemsId: componentItems.id,
        },
      });
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      const userId = ctx.session.user.id;

      if (!userId) {
        throw new Error("User not found");
      }

      const component = await ctx.db.component.findUnique({
        where: {
          id: id,
        },
      });

      if (!component) {
        throw new Error("Component not found");
      }

      return await ctx.db.component.delete({
        where: {
          id: id,
        },
      });
    }),

  getComponentFromHistory: protectedProcedure
    .input(
      z.object({
        componentId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.component.findUnique({
        where: {
          id: input.componentId,
        },
      });
    }),

  getCurrentComponentsHistory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.history.findMany({
        where: {
          componentId: input.id,
        },
        take: 20,
        orderBy: {
          changeAt: "desc",
        },
      });
    }),

  getAvaibleComponents: protectedProcedure
    .input(
      z.object({
        pageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { pageId } = input;

      return await ctx.db.component.findMany({
        where: {
          availablePages: {
            some: {
              id: pageId,
            },
          },
        },
      });
    }),

  addNewHistoryChangeLog: protectedProcedure
    .input(
      z.object({
        componentId: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { componentId } = input;

      const userId = ctx.session.user.id;

      if (!componentId) {
        throw new Error("Component not found");
      }

      if (!userId) {
        throw new Error("User not found");
      }

      return ctx.db.history.create({
        data: {
          componentId: componentId,
          userId: userId,
        },
      });
    }),

  addToCurrentPage: protectedProcedure
    .input(
      z.object({
        componentId: z.string(),
        pageId: z.string(),
        language: z.enum([Languages.EN, Languages.DE, Languages.PL]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { componentId, pageId } = input;

      const component = await ctx.db.component.findUnique({
        where: {
          id: componentId,
        },
        include: {
          input: true,
        },
      });

      const page = await ctx.db.page.findUnique({
        where: {
          id: pageId,
        },
        include: {
          pageLanguages: true,
        },
      });

      const pageComponents = await ctx.db.pageComponent.findMany({
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

      const newPageComponent = await ctx.db.pageComponent.create({
        data: {
          pageId: pageId,
          name: component.name,
          componentId: componentId,
          index: pageComponents.length,
          componentItemsId: component.componentItemsId,
          key: component.key,
        },
      });

      component.input.map(async (input) => {
        if (!input.componentItemId) {
          await ctx.db.pageInputsValues.create({
            data: {
              pageId: pageId,
              inputId: input.id,
              pageComponentId: newPageComponent.id,
            },
          });
        }
      });

      await ctx.db.pageComponent.update({
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

      const pageInputsValues = await ctx.db.pageInputsValues.findMany({
        where: {
          pageComponentId: newPageComponent.id,
        },
      });

      if (!pageInputsValues) {
        throw new Error("Page inputs values not found");
      }

      pageInputsValues.map((pageInputValue) => {
        page.pageLanguages.map(async (pageLanguage) => {
          await ctx.db.pageInputsValuesBasedOnLanguage.create({
            data: {
              pageInputsValuesId: pageInputValue.id,
              language: pageLanguage.language,
              value: "",
            },
          });
        });
      });

      return newPageComponent;
    }),
});
