import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const publicInputs = createTRPCRouter({
  get: publicProcedure
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
          value: true,
        },
      });
    }),

  getPageInput: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;

      return await ctx.db.pageInputsValues.findUnique({
        where: {
          id,
        },
      });
    }),
});
