import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import { createRouter } from "./context";

export const publicComponentsRouter = createRouter().query("getById", {
    input: z.string(),
    resolve: async ({ input, ctx }) => {
        return await ctx.prisma.component.findUnique({
            where: {
                id: input,
            },
            include: {
                input: true,
            },
        });
    },
});
