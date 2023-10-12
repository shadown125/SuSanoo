import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const publicComponents = createTRPCRouter({
  getById: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    return await ctx.db.component.findUnique({
      where: {
        id: input,
      },
      include: {
        input: true,
      },
    });
  }),
});
