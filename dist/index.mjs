var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};

// src/utils/api.ts
import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";
var getBaseUrl = () => {
  var _a2;
  if (typeof window !== "undefined")
    return "";
  if (process.env.VERCEL_URL)
    return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${(_a2 = process.env.PORT) != null ? _a2 : 3e3}`;
};
var api = createTRPCNext({
  config() {
    return {
      /**
       * Transformer used for data de-serialization from the server.
       *
       * @see https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
      /**
       * Links used to determine request flow from client to server.
       *
       * @see https://trpc.io/docs/links
       */
      links: [
        loggerLink({
          enabled: (opts) => process.env.NODE_ENV === "development" || opts.direction === "down" && opts.result instanceof Error
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`
        })
      ]
    };
  },
  /**
   * Whether tRPC should await queries when server rendering pages.
   *
   * @see https://trpc.io/docs/nextjs#ssr-boolean-default-false
   */
  ssr: false
});

// components/susanoo-core/susanoo-app.tsx
import { SessionProvider } from "next-auth/react";
import { appWithTranslation } from "next-i18next";

// components/head-page.tsx
import Head from "next/head";
var HeadPage = () => {
  return /* @__PURE__ */ React.createElement(Head, null, /* @__PURE__ */ React.createElement("meta", { charSet: "UTF-8" }), /* @__PURE__ */ React.createElement("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }), /* @__PURE__ */ React.createElement("meta", { httpEquiv: "X-UA-Compatible", content: "ie=edge" }), /* @__PURE__ */ React.createElement("meta", { name: "format-detection", content: "telephone=no" }));
};
var head_page_default = HeadPage;

// components/susanoo-core/susanoo-app.tsx
var SusanooApp = (_a2) => {
  var {
    Component,
    pageProps: _b
  } = _a2, _c = _b, { session } = _c, pageProps = __objRest(_c, ["session"]);
  return /* @__PURE__ */ React.createElement(SessionProvider, { session }, /* @__PURE__ */ React.createElement(head_page_default, null), /* @__PURE__ */ React.createElement("div", { className: "app" }, /* @__PURE__ */ React.createElement(Component, __spreadValues({}, pageProps))));
};
var susanoo_app_default = api.withTRPC(appWithTranslation(SusanooApp));

// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
var env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url().refine(
      (str) => !str.includes("YOUR_MYSQL_URL_HERE"),
      "You forgot to change the default URL"
    ),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXTAUTH_SECRET: process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => {
        var _a2;
        return (_a2 = process.env.VERCEL_URL) != null ? _a2 : str;
      },
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string() : z.string().url()
    )
    // Add ` on ID and SECRET if you want to make sure they're not empty
  },
  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true
});

// src/server/api/trpc.ts
import { initTRPC, TRPCError } from "@trpc/server";
import superjson2 from "superjson";
import { ZodError } from "zod";

// src/server/db.ts
import { PrismaClient } from "@prisma/client";
var globalForPrisma = globalThis;
var _a;
var db = (_a = globalForPrisma.prisma) != null ? _a : new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
});
if (env.NODE_ENV !== "production")
  globalForPrisma.prisma = db;

// src/server/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";

// lib/auth.ts
import { hash, compare } from "bcryptjs";
async function verifyPassword(password, hashedPassword) {
  return await compare(password, hashedPassword);
}

// src/server/auth.ts
import {
  getServerSession
} from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";
var authOptions = {
  callbacks: {
    session: ({ session, user, token }) => {
      if (session.user) {
        session.user.id = token.id;
      }
      return __spreadProps(__spreadValues({}, session), {
        user: __spreadProps(__spreadValues({}, session.user), {
          id: token.id
        })
      });
    },
    jwt: ({ token, user }) => {
      const data = token;
      if (user) {
        data.id = user.id;
      }
      return data;
    }
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "E-Mail",
          type: "email"
        },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        });
        if (!user) {
          throw new Error("invalidEmailOrPassword");
        }
        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("errorOccurred");
        }
        return user;
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
    updateAge: 5 * 60
  }
};
var getServerAuthSession = (ctx) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};

// src/server/api/trpc.ts
var createInnerTRPCContext = (opts) => {
  return {
    session: opts.session,
    db
  };
};
var createTRPCContext = async (opts) => {
  const { req, res } = opts;
  const session = await getServerAuthSession({ req, res });
  return createInnerTRPCContext({
    session
  });
};
var t = initTRPC.context().create({
  transformer: superjson2,
  errorFormatter({ shape, error }) {
    return __spreadProps(__spreadValues({}, shape), {
      data: __spreadProps(__spreadValues({}, shape.data), {
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null
      })
    });
  }
});
var createTRPCRouter = t.router;
var publicProcedure = t.procedure;
var enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  var _a2;
  if (!((_a2 = ctx.session) == null ? void 0 : _a2.user)) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `session` as non-nullable
      session: __spreadProps(__spreadValues({}, ctx.session), { user: ctx.session.user })
    }
  });
});
var protectedProcedure = t.procedure.use(enforceUserIsAuthed);

// src/server/api/routers/auth-components.ts
import { Languages } from "@prisma/client";
import { z as z2 } from "zod";
var authComponents = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.component.findMany({
      include: {
        input: true
      }
    });
  }),
  getPageComponentById: protectedProcedure.input(
    z2.object({
      id: z2.string()
    })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.pageComponent.findUnique({
      where: {
        id: input.id
      },
      include: {
        input: true,
        componentItems: {
          include: {
            inputs: true
          }
        }
      }
    });
  }),
  create: protectedProcedure.input(
    z2.object({
      componentName: z2.string(),
      key: z2.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const { componentName, key } = input;
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("User not found");
    }
    const components = await ctx.db.component.findMany();
    const component = components.find(
      (component2) => component2.name === componentName
    );
    if (component) {
      throw new Error("Component already exists");
    }
    const componentItems = await ctx.db.componentItems.create({
      data: {}
    });
    return await ctx.db.component.create({
      data: {
        name: componentName,
        key,
        componentItemsId: componentItems.id
      }
    });
  }),
  delete: protectedProcedure.input(
    z2.object({
      id: z2.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const { id } = input;
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("User not found");
    }
    const component = await ctx.db.component.findUnique({
      where: {
        id
      }
    });
    if (!component) {
      throw new Error("Component not found");
    }
    return await ctx.db.component.delete({
      where: {
        id
      }
    });
  }),
  getComponentFromHistory: protectedProcedure.input(
    z2.object({
      componentId: z2.string()
    })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.component.findUnique({
      where: {
        id: input.componentId
      }
    });
  }),
  getCurrentComponentsHistory: protectedProcedure.input(
    z2.object({
      id: z2.string()
    })
  ).query(async ({ ctx, input }) => {
    return await ctx.db.history.findMany({
      where: {
        componentId: input.id
      },
      take: 20,
      orderBy: {
        changeAt: "desc"
      }
    });
  }),
  getAvaibleComponents: protectedProcedure.input(
    z2.object({
      pageId: z2.string()
    })
  ).query(async ({ ctx, input }) => {
    const { pageId } = input;
    return await ctx.db.component.findMany({
      where: {
        availablePages: {
          some: {
            id: pageId
          }
        }
      }
    });
  }),
  addNewHistoryChangeLog: protectedProcedure.input(
    z2.object({
      componentId: z2.string()
    })
  ).mutation(({ ctx, input }) => {
    const { componentId } = input;
    const userId = ctx.session.user.id;
    if (!componentId) {
      throw new Error("Component not found");
    }
    if (!userId) {
      throw new Error("User not found");
    }
    return ctx.db.history.create({
      data: {
        componentId,
        userId
      }
    });
  }),
  addToCurrentPage: protectedProcedure.input(
    z2.object({
      componentId: z2.string(),
      pageId: z2.string(),
      language: z2.enum([Languages.EN, Languages.DE, Languages.PL])
    })
  ).mutation(async ({ ctx, input }) => {
    const { componentId, pageId, language } = input;
    const component = await ctx.db.component.findUnique({
      where: {
        id: componentId
      },
      include: {
        input: true
      }
    });
    const page = await ctx.db.page.findUnique({
      where: {
        id: pageId
      },
      include: {
        pageLanguages: true
      }
    });
    const pageComponents = await ctx.db.pageComponent.findMany({
      where: {
        pageId
      }
    });
    if (!component) {
      throw new Error("Component not found");
    }
    if (!page) {
      throw new Error("Page not found");
    }
    if (!pageComponents) {
      throw new Error("Page components not found");
    }
    const newPageComponent = await ctx.db.pageComponent.create({
      data: {
        pageId,
        name: component.name,
        componentId,
        index: pageComponents.length,
        componentItemsId: component.componentItemsId,
        key: component.key
      }
    });
    component.input.forEach(async (input2) => {
      if (!input2.componentItemId) {
        await ctx.db.pageInputsValues.create({
          data: {
            pageId,
            inputId: input2.id,
            pageComponentId: newPageComponent.id
          }
        });
      }
    });
    await ctx.db.pageComponent.update({
      where: {
        id: newPageComponent.id
      },
      data: {
        input: {
          connect: component.input.map((input2) => {
            return {
              id: input2.id
            };
          })
        }
      }
    });
    const pageInputsValues = await ctx.db.pageInputsValues.findMany({
      where: {
        pageComponentId: newPageComponent.id
      }
    });
    if (!pageInputsValues) {
      throw new Error("Page inputs values not found");
    }
    pageInputsValues.forEach(async (pageInputValue) => {
      page.pageLanguages.forEach(async (pageLanguage) => {
        await ctx.db.pageInputsValuesBasedOnLanguage.create({
          data: {
            pageInputsValuesId: pageInputValue.id,
            language: pageLanguage.language,
            value: ""
          }
        });
      });
    });
    return newPageComponent;
  })
});

// src/server/api/routers/auth-inputs.ts
import { InputsTypes, Languages as Languages2 } from "@prisma/client";
import { z as z3 } from "zod";
var authInputs = createTRPCRouter({
  getPageInputValues: protectedProcedure.input(
    z3.object({
      pageComponentId: z3.string(),
      pageId: z3.string()
    })
  ).query(async ({ input, ctx }) => {
    const { pageComponentId, pageId } = input;
    return await ctx.db.pageInputsValues.findMany({
      where: {
        pageId,
        pageComponentId
      },
      include: {
        input: true
      }
    });
  }),
  getById: protectedProcedure.input(z3.string()).query(async ({ input, ctx }) => {
    return await ctx.db.input.findUnique({
      where: {
        id: input
      }
    });
  }),
  create: protectedProcedure.input(
    z3.object({
      type: z3.enum([
        InputsTypes.text,
        InputsTypes.number,
        InputsTypes.email,
        InputsTypes.select,
        InputsTypes.checkbox,
        InputsTypes.radio,
        InputsTypes.date,
        InputsTypes.textarea
      ]).optional(),
      name: z3.string(),
      componentId: z3.string(),
      halfRow: z3.boolean(),
      required: z3.boolean(),
      isItemInput: z3.boolean()
    })
  ).mutation(async ({ input, ctx }) => {
    const currentComponent = await ctx.db.component.findUnique({
      where: {
        id: input.componentId
      },
      include: {
        PageComponent: true,
        componentItems: true
      }
    });
    const newInput = await ctx.db.input.create({
      data: {
        required: input.required,
        type: input.type,
        halfRow: input.halfRow,
        name: input.name,
        componentId: input.componentId,
        componentItemId: input.isItemInput ? currentComponent == null ? void 0 : currentComponent.componentItems.id : ""
      }
    });
    return currentComponent == null ? void 0 : currentComponent.PageComponent.forEach(async (pageComponent) => {
      const newPageInputValue = await ctx.db.pageInputsValues.create({
        data: {
          pageId: pageComponent.pageId,
          pageComponentId: pageComponent.id,
          inputId: newInput.id
        },
        include: {
          page: {
            include: {
              pageLanguages: true
            }
          }
        }
      });
      Object.keys(Languages2).forEach(async (language) => {
        var _a2;
        (_a2 = newPageInputValue.page) == null ? void 0 : _a2.pageLanguages.forEach(
          async (pageLanguage) => {
            if (pageLanguage.language === language) {
              await ctx.db.pageInputsValuesBasedOnLanguage.create({
                data: {
                  pageInputsValuesId: newPageInputValue.id,
                  language,
                  value: ""
                }
              });
            }
          }
        );
      });
    });
  }),
  update: protectedProcedure.input(
    z3.object({
      id: z3.string(),
      type: z3.enum([
        InputsTypes.text,
        InputsTypes.number,
        InputsTypes.email,
        InputsTypes.select,
        InputsTypes.checkbox,
        InputsTypes.radio,
        InputsTypes.date,
        InputsTypes.textarea
      ]).optional(),
      name: z3.string(),
      halfRow: z3.boolean(),
      required: z3.boolean()
    })
  ).mutation(async ({ input, ctx }) => {
    const { id, type, name, halfRow, required } = input;
    await ctx.db.input.update({
      where: {
        id
      },
      data: {
        type,
        name,
        halfRow,
        required
      }
    });
  }),
  delete: protectedProcedure.input(
    z3.object({
      id: z3.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const { id } = input;
    await ctx.db.pageInputsValues.deleteMany({
      where: {
        inputId: id
      }
    });
    await ctx.db.input.delete({
      where: {
        id
      }
    });
  }),
  getSelectOptions: protectedProcedure.input(
    z3.object({
      id: z3.string()
    })
  ).query(async ({ input, ctx }) => {
    const { id } = input;
    if (id === "") {
      return null;
    }
    return await ctx.db.selectOption.findMany({
      where: {
        inputId: id
      }
    });
  })
});

// src/server/api/routers/auth-pages.ts
import { Languages as Languages3 } from "@prisma/client";
import uuid from "react-uuid";
import { z as z4 } from "zod";
var authPages = createTRPCRouter({
  create: protectedProcedure.input(
    z4.object({
      name: z4.string(),
      route: z4.string(),
      components: z4.array(z4.string()),
      nestedPath: z4.string()
    })
  ).mutation(async ({ input, ctx }) => {
    const { name, route, components, nestedPath } = input;
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("User not found");
    }
    const page = await ctx.db.page.create({
      data: {
        authorId: userId,
        name,
        route,
        nestedPath
      }
    });
    await ctx.db.pageSeo.create({
      data: {
        title: name,
        pageId: page.id,
        language: Languages3.EN
      }
    });
    await ctx.db.pageLanguages.create({
      data: {
        pageId: page.id
      }
    });
    return components.forEach(async (componentId) => {
      await ctx.db.page.update({
        where: {
          id: page.id
        },
        data: {
          availableComponents: {
            connect: {
              id: componentId
            }
          }
        }
      });
    });
  }),
  get: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.page.findMany();
  }),
  getById: protectedProcedure.input(
    z4.object({
      id: z4.string().nullish()
    })
  ).query(async ({ ctx, input }) => {
    const { id } = input;
    if (!id)
      return null;
    return await ctx.db.page.findUnique({
      where: {
        id
      },
      include: {
        pageLanguages: true,
        pageSeo: true
      }
    });
  }),
  getPageAvailableComponents: protectedProcedure.input(
    z4.object({
      id: z4.string().nullish()
    })
  ).query(async ({ ctx, input }) => {
    const { id } = input;
    if (!id)
      return null;
    return await ctx.db.component.findMany({
      where: {
        availablePages: {
          some: {
            id
          }
        }
      }
    });
  }),
  getPageInputsValues: protectedProcedure.input(
    z4.object({
      pageId: z4.string()
    })
  ).query(async ({ ctx, input }) => {
    const { pageId } = input;
    return await ctx.db.pageInputsValues.findMany({
      where: {
        pageId
      }
    });
  }),
  getPageFromHistory: protectedProcedure.input(
    z4.object({
      pageId: z4.string()
    })
  ).query(async ({ ctx, input }) => {
    const { pageId } = input;
    return await ctx.db.page.findUnique({
      where: {
        id: pageId
      }
    });
  }),
  getCurrentPageHistory: protectedProcedure.input(
    z4.object({
      id: z4.string()
    })
  ).query(async ({ ctx, input }) => {
    const { id } = input;
    return await ctx.db.history.findMany({
      where: {
        pageId: id
      },
      take: 20,
      orderBy: {
        changeAt: "desc"
      }
    });
  }),
  addLanguageToCurrentPage: protectedProcedure.input(
    z4.object({
      pageId: z4.string(),
      language: z4.enum([Languages3.EN, Languages3.DE, Languages3.PL])
    })
  ).mutation(async ({ ctx, input }) => {
    const { pageId, language } = input;
    const currentPage = await ctx.db.page.findUnique({
      where: {
        id: pageId
      }
    });
    if (!currentPage)
      throw new Error("Page not found");
    const pageInputsValues = await ctx.db.pageInputsValues.findMany({
      where: {
        pageId
      },
      include: {
        value: true
      }
    });
    pageInputsValues.forEach(async (pageInputValue) => {
      await ctx.db.pageInputsValuesBasedOnLanguage.create({
        data: {
          pageInputsValuesId: pageInputValue.id,
          language,
          value: ""
        }
      });
    });
    await ctx.db.pageSeo.create({
      data: {
        title: currentPage.name,
        pageId,
        language
      }
    });
    return await ctx.db.pageLanguages.create({
      data: {
        pageId,
        language
      }
    });
  }),
  deleteLanguageFromCurrentPage: protectedProcedure.input(
    z4.object({
      pageId: z4.string(),
      language: z4.enum([Languages3.EN, Languages3.DE, Languages3.PL])
    })
  ).mutation(async ({ ctx, input }) => {
    const { pageId, language } = input;
    const pageInputsValues = await ctx.db.pageInputsValues.findMany({
      where: {
        pageId
      },
      include: {
        value: true
      }
    });
    pageInputsValues.forEach(async (pageInputValue) => {
      await ctx.db.pageInputsValuesBasedOnLanguage.deleteMany({
        where: {
          pageInputsValuesId: pageInputValue.id,
          language
        }
      });
    });
    const page = await ctx.db.page.findUnique({
      where: {
        id: pageId
      },
      include: {
        pageLanguages: true,
        pageSeo: true
      }
    });
    const currentPageLanguage = page == null ? void 0 : page.pageLanguages.find(
      (pageLanguage) => pageLanguage.language === language
    );
    const currentSeoLanguagePage = page == null ? void 0 : page.pageSeo.find(
      (pageSeo) => pageSeo.language === language
    );
    if (!currentPageLanguage) {
      throw new Error("Page language not found");
    }
    await ctx.db.pageSeo.delete({
      where: {
        id: currentSeoLanguagePage == null ? void 0 : currentSeoLanguagePage.id
      }
    });
    await ctx.db.pageLanguages.delete({
      where: {
        id: currentPageLanguage.id
      }
    });
  }),
  getCurrentPageLanguages: protectedProcedure.input(
    z4.object({
      pageId: z4.string()
    })
  ).query(async ({ ctx, input }) => {
    const { pageId } = input;
    return await ctx.db.pageLanguages.findMany({
      where: {
        pageId
      }
    });
  }),
  updateCurrentPage: protectedProcedure.input(
    z4.object({
      id: z4.string().nullish(),
      name: z4.string(),
      route: z4.string(),
      components: z4.array(z4.string()),
      nestedPath: z4.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const { id, name, route, components, nestedPath } = input;
    let routeName = route;
    if (!id) {
      throw new Error("Page not found");
    }
    const currentPage = await ctx.db.page.findUnique({
      where: {
        id
      }
    });
    if ((currentPage == null ? void 0 : currentPage.route) === "/") {
      routeName = "/";
    }
    await ctx.db.page.update({
      where: {
        id
      },
      data: {
        name,
        route: routeName,
        nestedPath
      }
    });
    await ctx.db.page.update({
      where: {
        id
      },
      data: {
        availableComponents: {
          set: components.map((componentId) => ({
            id: componentId
          }))
        }
      }
    });
  }),
  setNewPageHistoryChangeLog: protectedProcedure.input(
    z4.object({
      pageId: z4.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const { pageId } = input;
    const userId = ctx.session.user.id;
    if (!userId) {
      throw new Error("User not found");
    }
    return await ctx.db.history.create({
      data: {
        pageId,
        userId
      }
    });
  }),
  getPageComponentItemById: protectedProcedure.input(
    z4.object({
      id: z4.string()
    })
  ).query(async ({ ctx, input }) => {
    const { id } = input;
    return await ctx.db.pageComponentsItem.findUnique({
      where: {
        id
      },
      include: {
        inputs: {
          include: {
            value: {
              include: {
                value: true
              }
            }
          }
        }
      }
    });
  }),
  createPageComponentItem: protectedProcedure.input(
    z4.object({
      pageId: z4.string(),
      name: z4.string(),
      componentId: z4.string(),
      pageComponentData: z4.record(z4.string(), z4.string())
    })
  ).mutation(async ({ ctx, input }) => {
    const { pageId, name, componentId, pageComponentData } = input;
    const page = await ctx.db.page.findUnique({
      where: {
        id: pageId
      },
      include: {
        pageLanguages: true
      }
    });
    const pageComponent = await ctx.db.pageComponent.findUnique({
      where: {
        id: componentId
      },
      include: {
        componentItems: {
          include: {
            inputs: true
          }
        }
      }
    });
    if (!pageComponent) {
      throw new Error("Page component not found");
    }
    if (!page) {
      throw new Error("Page not found");
    }
    const pageComponentItem = await ctx.db.pageComponentsItem.create({
      data: {
        name,
        pageComponentId: pageComponent.id,
        inputs: {
          connect: pageComponent.componentItems.inputs.map((input2) => ({
            id: input2.id
          }))
        }
      }
    });
    for (const [key, value] of Object.entries(pageComponentData)) {
      pageComponent.componentItems.inputs.forEach(async (input2) => {
        if (input2.componentItemId === pageComponent.componentItemsId && input2.id === key) {
          const uniqueId = uuid();
          const pageInputsValue = await ctx.db.pageInputsValues.create({
            data: {
              pageId,
              inputId: input2.id,
              pageComponentId: pageComponent.id,
              pageComponentItemsInputId: uniqueId,
              pageComponentItemsId: pageComponentItem.id
            }
          });
          page.pageLanguages.forEach(async (pageLanguage) => {
            await ctx.db.pageInputsValuesBasedOnLanguage.create({
              data: {
                pageInputsValuesId: pageInputsValue.id,
                language: pageLanguage.language,
                value
              }
            });
          });
        }
      });
    }
  }),
  getCurrentPageComponents: protectedProcedure.input(
    z4.object({
      name: z4.string(),
      pageId: z4.string()
    })
  ).query(async ({ ctx, input }) => {
    const { pageId } = input;
    const components = await ctx.db.pageComponent.findMany({
      where: {
        pageId
      },
      include: {
        componentItems: {
          include: {
            inputs: true
          }
        },
        pageComponentsItem: true,
        input: {
          include: {
            value: true
          }
        },
        PageInputsValues: {
          include: {
            value: true
          }
        }
      }
    });
    return components.sort((a, b) => {
      if (a.index || b.index) {
        return a.index < b.index ? -1 : 1;
      }
      return 0;
    });
  }),
  updatePageComponentsIndex: protectedProcedure.input(
    z4.object({
      id: z4.string(),
      index: z4.number()
    })
  ).mutation(async ({ ctx, input }) => {
    const { id, index } = input;
    return await ctx.db.pageComponent.update({
      where: {
        id
      },
      data: {
        index
      }
    });
  }),
  createPageSeo: protectedProcedure.input(
    z4.object({
      pageId: z4.string(),
      language: z4.enum([Languages3.EN, Languages3.DE, Languages3.PL]),
      title: z4.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const { pageId, language, title } = input;
    return await ctx.db.pageSeo.create({
      data: {
        title,
        pageId,
        language
      }
    });
  }),
  getPageSeo: protectedProcedure.input(
    z4.object({
      pageId: z4.string(),
      language: z4.enum([Languages3.EN, Languages3.DE, Languages3.PL])
    })
  ).query(async ({ ctx, input }) => {
    const { pageId, language } = input;
    const pageSeos = await ctx.db.pageSeo.findMany({
      where: {
        pageId
      }
    });
    return pageSeos.find((pageSeo) => pageSeo.language === language);
  }),
  updatePageSeo: protectedProcedure.input(
    z4.object({
      pageId: z4.string(),
      language: z4.enum([Languages3.EN, Languages3.DE, Languages3.PL]),
      title: z4.string(),
      favicon: z4.string().optional(),
      description: z4.string().optional(),
      author: z4.string().optional(),
      twitterAuthor: z4.string().optional(),
      twitterSite: z4.string().optional()
    })
  ).mutation(async ({ ctx, input }) => {
    const {
      pageId,
      language,
      title,
      favicon,
      description,
      author,
      twitterAuthor,
      twitterSite
    } = input;
    const currentPage = await ctx.db.page.findUnique({
      where: {
        id: pageId
      },
      include: {
        pageSeo: true
      }
    });
    return currentPage == null ? void 0 : currentPage.pageSeo.forEach(async (pageSeo) => {
      if (pageSeo.language === language) {
        await ctx.db.pageSeo.update({
          where: {
            id: pageSeo.id
          },
          data: {
            title,
            favicon,
            author,
            description,
            twitterAuthor,
            twitterSite
          }
        });
      }
    });
  }),
  setNewPageInputValue: protectedProcedure.input(
    z4.object({
      inputId: z4.string(),
      value: z4.string(),
      language: z4.enum([Languages3.EN, Languages3.DE, Languages3.PL])
    })
  ).mutation(async ({ ctx, input }) => {
    const { inputId, value, language } = input;
    const inputValue = await ctx.db.pageInputsValues.findUnique({
      where: {
        id: inputId
      },
      include: {
        value: true
      }
    });
    if (!inputValue) {
      throw new Error("Input value not found");
    }
    const pageInputLanguageValue = inputValue.value.find(
      (pageInputValue) => pageInputValue.language === language && pageInputValue.pageInputsValuesId === inputValue.id
    );
    if (!pageInputLanguageValue) {
      throw new Error("Page input language value not found");
    }
    return await ctx.db.pageInputsValuesBasedOnLanguage.update({
      where: {
        id: pageInputLanguageValue.id
      },
      data: {
        value
      }
    });
  }),
  deletePageComponent: protectedProcedure.input(
    z4.object({
      pageId: z4.string(),
      componentId: z4.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const { componentId, pageId } = input;
    const component = await ctx.db.pageComponent.findUnique({
      where: {
        id: componentId
      }
    });
    if (!component) {
      throw new Error("Component not found");
    }
    await ctx.db.pageComponent.delete({
      where: {
        id: componentId
      }
    });
    await ctx.db.pageInputsValues.deleteMany({
      where: {
        pageId,
        input: {
          componentId
        }
      }
    });
  }),
  deletePageComponentItem: protectedProcedure.input(
    z4.object({
      pageComponentItemId: z4.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const { pageComponentItemId } = input;
    const pageComponentItem = await ctx.db.pageComponentsItem.findUnique({
      where: {
        id: pageComponentItemId
      }
    });
    if (!pageComponentItem)
      throw new Error("Page component item not found");
    await ctx.db.pageComponentsItem.delete({
      where: {
        id: pageComponentItemId
      }
    });
    await ctx.db.pageInputsValues.deleteMany({
      where: {
        pageComponentItemsId: pageComponentItemId
      }
    });
  }),
  updateActiveState: protectedProcedure.input(
    z4.object({
      id: z4.string(),
      active: z4.boolean()
    })
  ).mutation(async ({ ctx, input }) => {
    const { id, active } = input;
    return await ctx.db.page.update({
      where: {
        id
      },
      data: {
        active
      }
    });
  }),
  delete: protectedProcedure.input(
    z4.object({
      id: z4.string()
    })
  ).mutation(async ({ ctx, input }) => {
    const { id } = input;
    await ctx.db.page.delete({
      where: {
        id
      }
    });
  })
});

// src/server/api/routers/auth-router.ts
import { z as z5 } from "zod";
var authRouter = createTRPCRouter({
  getSession: protectedProcedure.input(z5.object({ text: z5.string() })).query(({ ctx }) => {
    return ctx.session;
  }),
  getProfile: protectedProcedure.query(({ ctx }) => {
    const { name, image, email } = ctx.session.user;
    return {
      name,
      image,
      email
    };
  }),
  getUser: protectedProcedure.input(
    z5.object({
      id: z5.string()
    })
  ).query(async ({ input, ctx }) => {
    const { id } = input;
    return await ctx.db.user.findUnique({
      where: {
        id
      }
    });
  }),
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      where: {
        id: {
          not: ctx.session.user.id
        }
      }
    });
  }),
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany();
  }),
  getOnlineUsersAmount: protectedProcedure.query(async ({ ctx }) => {
    const OnlineUsers = await ctx.db.user.findMany({
      where: {
        status: true
      }
    });
    return OnlineUsers.length;
  }),
  getCompleteHistory: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.history.findMany({
      take: 20,
      orderBy: {
        changeAt: "desc"
      }
    });
  }),
  setUserStatus: protectedProcedure.input(
    z5.object({
      status: z5.boolean()
    })
  ).mutation(async ({ input, ctx }) => {
    const { status } = input;
    console.log(ctx.session.user.id);
    return await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: {
        status
      }
    });
  })
});

// src/server/api/routers/public-components.ts
import { z as z6 } from "zod";
var publicComponents = createTRPCRouter({
  getById: publicProcedure.input(z6.string()).query(async ({ input, ctx }) => {
    return await ctx.db.component.findUnique({
      where: {
        id: input
      },
      include: {
        input: true
      }
    });
  })
});

// src/server/api/routers/public-inputs.ts
import { z as z7 } from "zod";
var publicInputs = createTRPCRouter({
  get: publicProcedure.input(
    z7.object({
      pageComponentId: z7.string(),
      pageId: z7.string()
    })
  ).query(async ({ input, ctx }) => {
    const { pageComponentId, pageId } = input;
    return await ctx.db.pageInputsValues.findMany({
      where: {
        pageId,
        pageComponentId
      },
      include: {
        input: true,
        value: true
      }
    });
  }),
  getPageInput: publicProcedure.input(
    z7.object({
      id: z7.string()
    })
  ).query(async ({ input, ctx }) => {
    const { id } = input;
    return await ctx.db.pageInputsValues.findUnique({
      where: {
        id
      }
    });
  })
});

// src/server/api/routers/public-pages.ts
var publicPages = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.page.findMany({
      include: {
        pageComponents: true,
        pageSeo: true
      }
    });
  })
});

// src/server/api/root.ts
var appRouter = createTRPCRouter({
  auth: authRouter,
  authComponents,
  authInputs,
  authPages,
  publicComponents,
  publicInputs,
  publicPages
});

// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from "@trpc/server/adapters/next";
var trpc_default = createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError: env.NODE_ENV === "development" ? ({ path, error }) => {
    console.error(
      `\u274C tRPC failed on ${path != null ? path : "<no-path>"}: ${error.message}`
    );
  } : void 0
});

// components/susanoo-core/provider.tsx
import { createElement } from "react";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";
import { useRoutes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";

// sus-hooks/index.tsx
import { Languages as Languages4 } from "@prisma/client";
var useSusInputs = ({
  pageComponentId,
  pageId,
  language
}) => {
  const { data } = api.publicInputs.get.useQuery({
    pageComponentId,
    pageId
  });
  let extractedData = {};
  let extractedComponentItems = [];
  data == null ? void 0 : data.forEach((component) => {
    var _a2;
    const name = component.input.name;
    const value = (_a2 = component.value.find(
      (value2) => value2.language === Languages4[language.toUpperCase()]
    )) == null ? void 0 : _a2.value;
    if (typeof value === "undefined" || typeof name === "undefined") {
      return;
    }
    if (component.input.componentItemId && name && value) {
      extractedComponentItems.push({
        name,
        value
      });
      return;
    }
    extractedData[name] = value;
  });
  return {
    data: extractedData,
    items: extractedComponentItems
  };
};

// sus-components/test2/index.tsx
var Test2 = ({ susProps }) => {
  const { data, items } = useSusInputs(susProps);
  const { text, text2 } = data;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", { className: "headline h1" }, text), /* @__PURE__ */ React.createElement("h1", { className: "headline h3" }, text2), items.map((item, index) => /* @__PURE__ */ React.createElement("h1", { key: index, className: "headline h3" }, item.name, ": ", item.value)));
};

// sus-components/index.tsx
var SusComponents = {
  section1: Test2,
  section2: Test2
};

// components/susanoo-core/provider.tsx
var SusanooProvider = ({ errorPage }) => {
  const { data: pages, isLoading } = api.publicPages.getAll.useQuery();
  const nextRouter = useRouter();
  if (isLoading)
    return /* @__PURE__ */ React.createElement(React.Fragment, null);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, nextRouter.isReady && /* @__PURE__ */ React.createElement(
    StaticRouter,
    {
      location: nextRouter.locale === nextRouter.defaultLocale ? nextRouter.asPath : "/" + nextRouter.locale + nextRouter.asPath
    },
    /* @__PURE__ */ React.createElement(
      InitialPage,
      {
        pages: pages || [],
        errorPage
      }
    )
  ));
};
var InitialPage = ({ pages, errorPage }) => {
  const nextRouter = useRouter();
  const router = useRoutes([
    ...pages == null ? void 0 : pages.map(
      (page) => {
        var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
        return page.active ? {
          key: page.name,
          path: `/${nextRouter.locale === nextRouter.defaultLocale ? "" : nextRouter.locale}${page.route}`,
          element: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
            NextSeo,
            {
              title: ((_b = (_a2 = page.pageSeo) == null ? void 0 : _a2.find(
                (seo) => {
                  var _a3;
                  return seo.language === ((_a3 = nextRouter.locale) == null ? void 0 : _a3.toUpperCase());
                }
              )) == null ? void 0 : _b.title) || "",
              description: ((_d = (_c = page.pageSeo) == null ? void 0 : _c.find(
                (seo) => {
                  var _a3;
                  return seo.language === ((_a3 = nextRouter.locale) == null ? void 0 : _a3.toUpperCase());
                }
              )) == null ? void 0 : _d.description) || "",
              twitter: {
                handle: `@${((_f = (_e = page.pageSeo) == null ? void 0 : _e.find(
                  (seo) => {
                    var _a3;
                    return seo.language === ((_a3 = nextRouter.locale) == null ? void 0 : _a3.toUpperCase());
                  }
                )) == null ? void 0 : _f.twitterAuthor) || ""}`,
                site: `@${((_h = (_g = page.pageSeo) == null ? void 0 : _g.find(
                  (seo) => {
                    var _a3;
                    return seo.language === ((_a3 = nextRouter.locale) == null ? void 0 : _a3.toUpperCase());
                  }
                )) == null ? void 0 : _h.twitterSite) || ""}`,
                cardType: "summary_large_image"
              },
              additionalMetaTags: [
                {
                  name: "author",
                  content: ((_j = (_i = page.pageSeo) == null ? void 0 : _i.find(
                    (seo) => {
                      var _a3;
                      return seo.language === ((_a3 = nextRouter.locale) == null ? void 0 : _a3.toUpperCase());
                    }
                  )) == null ? void 0 : _j.author) || ""
                }
              ],
              languageAlternates: [
                ...((_k = page.pageSeo) == null ? void 0 : _k.map((seo) => ({
                  hrefLang: `${nextRouter.basePath}${seo.language.toLowerCase()}`,
                  href: `/${seo.language.toLowerCase()}${page.route}`
                }))) || [],
                {
                  hrefLang: "x-default",
                  href: `${nextRouter.basePath}${page.route}`
                }
              ],
              additionalLinkTags: [
                {
                  rel: "icon",
                  href: ((_m = (_l = page.pageSeo) == null ? void 0 : _l.find(
                    (seo) => {
                      var _a3;
                      return seo.language === ((_a3 = nextRouter.locale) == null ? void 0 : _a3.toUpperCase());
                    }
                  )) == null ? void 0 : _m.favicon) || ""
                },
                {
                  rel: "apple-touch-icon",
                  href: ((_o = (_n = page.pageSeo) == null ? void 0 : _n.find(
                    (seo) => {
                      var _a3;
                      return seo.language === ((_a3 = nextRouter.locale) == null ? void 0 : _a3.toUpperCase());
                    }
                  )) == null ? void 0 : _o.favicon) || ""
                }
              ]
            }
          ), page.pageComponents.sort((a, b) => a.index - b.index).map((component) => {
            const componentExist = Object.keys(SusComponents).find(
              (key) => key === component.key.toLowerCase()
            );
            const Component = componentExist && createElement(
              SusComponents[componentExist],
              {
                key: component.id,
                susProps: {
                  pageComponentId: component.id,
                  pageId: page.id,
                  language: nextRouter.locale
                }
              }
            );
            return Component;
          }))
        } : {
          path: `*`,
          element: errorPage || /* @__PURE__ */ React.createElement(React.Fragment, null, "Hehehe 404")
        };
      }
    ),
    {
      path: `*`,
      element: errorPage || /* @__PURE__ */ React.createElement(React.Fragment, null, "Hehehe 404")
    }
  ]);
  return router;
};
export {
  susanoo_app_default as SusanooApp,
  SusanooProvider,
  authOptions,
  trpc_default as createNextApiHandler,
  useSusInputs
};
