import NextAuth, { type NextAuthOptions } from "next-auth";

import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";
import { env } from "../../../env/server.mjs";
import CredentialProvider from "next-auth/providers/credentials";
import { verifyPassword } from "../../../../lib/auth";

export const authOptions: NextAuthOptions = {
    callbacks: {
        session({ session, user, token }) {
            if (session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
        jwt: async ({ user, token }) => {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async redirect({ baseUrl }) {
            return `${baseUrl}/admin/panel`;
        },
    },
    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialProvider({
            name: "credentials",
            credentials: {
                email: {
                    label: "E-Mail",
                    type: "email",
                },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials!.email,
                    },
                });

                if (!user) {
                    throw new Error("invalidEmailOrPassword");
                }

                const isValid = await verifyPassword(credentials!.password, user.password);

                if (!isValid) {
                    throw new Error("errorOccurred");
                }

                return user;
            },
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
        maxAge: 2 * 60 * 60,
        updateAge: 5 * 60,
    },
};

export default NextAuth(authOptions);
