import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const authRouter = createTRPCRouter({
  getSession: protectedProcedure
    .input(z.object({ text: z.string() }))
    .query(({ ctx }) => {
      return ctx.session;
    }),

  getProfile: protectedProcedure.query(({ ctx }) => {
    const { name, image, email } = ctx.session.user;

    return {
      name,
      image,
      email,
    };
  }),

  getUser: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id } = input;

      return await ctx.db.user.findUnique({
        where: {
          id,
        },
      });
    }),

  getUsers: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        id: {
          not: ctx.session.user.id,
        },
      },
    });
  }),

  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany();
  }),

  getOnlineUsersAmount: protectedProcedure.query(async ({ ctx }) => {
    const OnlineUsers = await ctx.db.user.findMany({
      where: {
        status: true,
      },
    });

    return OnlineUsers.length;
  }),

  getCompleteHistory: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.history.findMany({
      take: 20,
      orderBy: {
        changeAt: "desc",
      },
    });
  }),

  setUserStatus: protectedProcedure
    .input(
      z.object({
        status: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { status } = input;

      console.log(ctx.session.user.id);

      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          status,
        },
      });
    }),
});
