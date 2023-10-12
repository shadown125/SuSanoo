import { createTRPCRouter } from "@/server/api/trpc";
import { authComponents } from "./routers/auth-components";
import { authInputs } from "./routers/auth-inputs";
import { authPages } from "./routers/auth-pages";
import { authRouter } from "./routers/auth-router";
import { publicComponents } from "./routers/public-components";
import { publicInputs } from "./routers/public-inputs";
import { publicPages } from "./routers/public-pages";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  authComponents: authComponents,
  authInputs: authInputs,
  authPages: authPages,
  publicComponents: publicComponents,
  publicInputs: publicInputs,
  publicPages: publicPages,
});

// export type definition of API
export type AppRouter = typeof appRouter;
