import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { InputsTypes, Languages } from "@prisma/client";
import { z } from "zod";

export const authInputs = createTRPCRouter({
  getPageInputValues: protectedProcedure
    .input(
      z.object({
        pageComponentId: z.string(),
        pageId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { pageComponentId, pageId } = input;

      return await ctx.db.pageInputsValues.findMany({
        where: {
          pageId: pageId,
          pageComponentId: pageComponentId,
        },
        include: {
          input: true,
        },
      });
    }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      return await ctx.db.input.findUnique({
        where: {
          id: input,
        },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        type: z
          .enum([
            InputsTypes.text,
            InputsTypes.number,
            InputsTypes.email,
            InputsTypes.select,
            InputsTypes.checkbox,
            InputsTypes.radio,
            InputsTypes.date,
            InputsTypes.textarea,
          ])
          .optional(),
        name: z.string(),
        componentId: z.string(),
        halfRow: z.boolean(),
        required: z.boolean(),
        isItemInput: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const currentComponent = await ctx.db.component.findUnique({
        where: {
          id: input.componentId,
        },
        include: {
          PageComponent: true,
          componentItems: true,
        },
      });

      const newInput = await ctx.db.input.create({
        data: {
          required: input.required,
          type: input.type,
          halfRow: input.halfRow,
          name: input.name,
          componentId: input.componentId,
          componentItemId: input.isItemInput
            ? currentComponent?.componentItems.id
            : "",
        },
      });

      return currentComponent?.PageComponent.map(async (pageComponent) => {
        const newPageInputValue = await ctx.db.pageInputsValues.create({
          data: {
            pageId: pageComponent.pageId,
            pageComponentId: pageComponent.id,
            inputId: newInput.id,
          },
          include: {
            page: {
              include: {
                pageLanguages: true,
              },
            },
          },
        });

        Object.keys(Languages).forEach((language) => {
          newPageInputValue.page?.pageLanguages.map(async (pageLanguage) => {
            if (pageLanguage.language === language) {
              await ctx.db.pageInputsValuesBasedOnLanguage.create({
                data: {
                  pageInputsValuesId: newPageInputValue.id,
                  language: language,
                  value: "",
                },
              });
            }
          });
        });
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z
          .enum([
            InputsTypes.text,
            InputsTypes.number,
            InputsTypes.email,
            InputsTypes.select,
            InputsTypes.checkbox,
            InputsTypes.radio,
            InputsTypes.date,
            InputsTypes.textarea,
          ])
          .optional(),
        name: z.string(),
        halfRow: z.boolean(),
        required: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { id, type, name, halfRow, required } = input;

      await ctx.db.input.update({
        where: {
          id: id,
        },
        data: {
          type: type,
          name: name,
          halfRow: halfRow,
          required: required,
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

      await ctx.db.pageInputsValues.deleteMany({
        where: {
          inputId: id,
        },
      });

      await ctx.db.input.delete({
        where: {
          id: id,
        },
      });
    }),

  getSelectOptions: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;

      if (id === "") {
        return null;
      }

      return await ctx.db.selectOption.findMany({
        where: {
          inputId: id,
        },
      });
    }),
});
