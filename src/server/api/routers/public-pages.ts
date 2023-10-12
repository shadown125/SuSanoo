import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const publicPages = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.page.findMany({
      include: {
        pageComponents: true,
        pageSeo: true,
      },
    });
  }),
});
