// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedAuthRouter } from "./protected-auth-router";

export const appRouter = createRouter().transformer(superjson).merge("example.", exampleRouter).merge("auth.", protectedAuthRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
