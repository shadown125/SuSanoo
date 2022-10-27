import { createProtectedRouter } from "./protected-router";
import { z } from "zod";

// Example router with queries that can only be hit if the user requesting is signed in
export const protectedAuthRouter = createProtectedRouter()
    .query("getSession", {
        resolve({ ctx }) {
            return ctx.session;
        },
    })
    .query("getSecretMessage", {
        resolve({ ctx }) {
            return "He who asks a question is a fool for five minutes; he who does not ask a question remains a fool forever.";
        },
    })
    .query("getProfile", {
        resolve({ ctx }) {
            const { name, image, email } = ctx.session.user;

            return {
                name,
                image,
                email,
            };
        },
    })
    .query("getUsers", {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.user.findMany({
                where: {
                    id: {
                        not: ctx.session.user.id,
                    },
                },
            });
        },
    })
    .query("getAllUsers", {
        resolve: async ({ ctx }) => {
            return await ctx.prisma.user.findMany();
        },
    })
    .query("getOnlineUsersAmount", {
        resolve: async ({ ctx }) => {
            const OnlineUsers = await ctx.prisma.user.findMany({
                where: {
                    status: true,
                },
            });

            return OnlineUsers.length;
        },
    })

    .mutation("setUserStatus", {
        input: z.object({
            status: z.boolean(),
        }),
        resolve: async ({ input, ctx }) => {
            const { status } = input;

            return await ctx.prisma.user.update({
                where: { id: ctx.session.user.id },
                data: {
                    status,
                },
            });
        },
    });
