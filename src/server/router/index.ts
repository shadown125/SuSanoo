// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";

import { exampleRouter } from "./example";
import { protectedAuthRouter } from "./protected-auth-router";
import { protectedAuthPageRouter } from "./protected-auth-pages-router";
import { protectedAuthInputsRouter } from "./protected-auth-inputs-router";
import { protectedAuthComponentsRouter } from "./protected-auth-components-router";

export const appRouter = createRouter()
    .transformer(superjson)
    .merge("example.", exampleRouter)
    .merge("auth.", protectedAuthRouter)
    .merge("auth.pages.", protectedAuthPageRouter)
    .merge("auth.inputs.", protectedAuthInputsRouter)
    .merge("auth.components.", protectedAuthComponentsRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
