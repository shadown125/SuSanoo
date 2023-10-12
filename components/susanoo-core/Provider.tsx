import { createElement, type FC } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { type Page, type PageComponent, type PageSeo } from "@prisma/client";
import { NextSeo } from "next-seo";
import { useRoutes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { SusComponents, type SusComponetsType } from "../../sus-components";

export const SusanooProvider: FC<{
  errorPage?: JSX.Element | JSX.Element[];
}> = ({ errorPage }) => {
  const { data: pages, isLoading } = api.publicPages.getAll.useQuery();
  const nextRouter = useRouter();

  if (isLoading) return <></>;

  return (
    <>
      {nextRouter.isReady && (
        <StaticRouter
          location={
            nextRouter.locale === nextRouter.defaultLocale
              ? nextRouter.asPath
              : "/" + nextRouter.locale + nextRouter.asPath
          }
        >
          <InitialPage
            pages={
              (pages as (Page & {
                pageComponents: PageComponent[];
                pageSeo: PageSeo[];
              })[]) || []
            }
            errorPage={errorPage}
          />
        </StaticRouter>
      )}
    </>
  );
};

const InitialPage: FC<{
  pages: (Page & {
    pageComponents: PageComponent[];
    pageSeo: PageSeo[];
  })[];
  errorPage?: JSX.Element | JSX.Element[];
}> = ({ pages, errorPage }) => {
  const nextRouter = useRouter();

  const router = useRoutes([
    ...pages?.map((page) =>
      page.active
        ? {
            key: page.name,
            path: `/${
              nextRouter.locale === nextRouter.defaultLocale
                ? ""
                : nextRouter.locale
            }${page.route}`,
            element: (
              <>
                <NextSeo
                  title={
                    page.pageSeo?.find(
                      (seo) =>
                        seo.language === nextRouter.locale?.toUpperCase(),
                    )?.title || ""
                  }
                  description={
                    page.pageSeo?.find(
                      (seo) =>
                        seo.language === nextRouter.locale?.toUpperCase(),
                    )?.description || ""
                  }
                  twitter={{
                    handle: `@${
                      page.pageSeo?.find(
                        (seo) =>
                          seo.language === nextRouter.locale?.toUpperCase(),
                      )?.twitterAuthor || ""
                    }`,
                    site: `@${
                      page.pageSeo?.find(
                        (seo) =>
                          seo.language === nextRouter.locale?.toUpperCase(),
                      )?.twitterSite || ""
                    }`,
                    cardType: "summary_large_image",
                  }}
                  additionalMetaTags={[
                    {
                      name: "author",
                      content:
                        page.pageSeo?.find(
                          (seo) =>
                            seo.language === nextRouter.locale?.toUpperCase(),
                        )?.author || "",
                    },
                  ]}
                  languageAlternates={[
                    ...(page.pageSeo?.map((seo) => ({
                      hrefLang: `${
                        nextRouter.basePath
                      }${seo.language.toLowerCase()}`,
                      href: `/${seo.language.toLowerCase()}${page.route}`,
                    })) || []),
                    {
                      hrefLang: "x-default",
                      href: `${nextRouter.basePath}${page.route}`,
                    },
                  ]}
                  additionalLinkTags={[
                    {
                      rel: "icon",
                      href:
                        page.pageSeo?.find(
                          (seo) =>
                            seo.language === nextRouter.locale?.toUpperCase(),
                        )?.favicon || "",
                    },
                    {
                      rel: "apple-touch-icon",
                      href:
                        page.pageSeo?.find(
                          (seo) =>
                            seo.language === nextRouter.locale?.toUpperCase(),
                        )?.favicon || "",
                    },
                  ]}
                />
                {page.pageComponents
                  .sort((a, b) => a.index - b.index)
                  .map((component) => {
                    const componentExist = Object.keys(SusComponents).find(
                      (key) => key === component.key.toLowerCase(),
                    );

                    const Component =
                      componentExist &&
                      createElement(
                        SusComponents[
                          componentExist as keyof typeof SusComponents
                        ] as SusComponetsType,
                        {
                          key: component.id,
                          susProps: {
                            pageComponentId: component.id,
                            pageId: page.id,
                            language: nextRouter.locale as string,
                          },
                        },
                      );

                    return Component;
                  })}
              </>
            ),
          }
        : {
            path: `*`,
            element: errorPage || <>Hehehe 404</>,
          },
    ),
    {
      path: `*`,
      element: errorPage || <>Hehehe 404</>,
    },
  ]);

  return router;
};
