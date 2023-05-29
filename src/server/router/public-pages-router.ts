import { z } from "zod";
import { createRouter } from "./context";

export const publicPagesRouter = createRouter().query("getAll", {
    resolve: async ({ ctx }) => {
        return await ctx.prisma.page.findMany({
            include: {
                pageComponents: true,
            },
        });
    },
});
