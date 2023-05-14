import type { NextPage } from "next";
import { trpc } from "../utils/trpc";
import { FC, createElement } from "react";
import { useRouter } from "next/router";
import { useRoutes } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { Component, Page } from "@prisma/client";
import { SusComponents, SusComponetsType } from "../../sus-components";

const Home: NextPage = () => {
    return <SusanooProvider />;
};

export default Home;

const SusanooProvider: FC<{
    errorPage?: JSX.Element | JSX.Element[];
}> = ({ errorPage }) => {
    const { data: pages, isLoading } = trpc.useQuery(["pages.getAll"]);
    const nextRouter = useRouter();

    if (isLoading) return <></>;

    return (
        <>
            {nextRouter.isReady && (
                <StaticRouter location={nextRouter.locale === nextRouter.defaultLocale ? nextRouter.asPath : "/" + nextRouter.locale + nextRouter.asPath}>
                    <InitialPage
                        pages={
                            (pages as (Page & {
                                components: Component[];
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
        components: Component[];
    })[];
    errorPage?: JSX.Element | JSX.Element[];
}> = ({ pages, errorPage }) => {
    const nextRouter = useRouter();

    const router = useRoutes([
        ...pages?.map((page) => ({
            key: page.name,
            path: `/${nextRouter.locale === nextRouter.defaultLocale ? "" : nextRouter.locale}/${page.route}`,
            element: (
                <>
                    {page.components.map((component) => {
                        const componentExist = Object.keys(SusComponents).find((key) => key === component.name.toLowerCase());
                        const Component =
                            componentExist &&
                            createElement(SusComponents[componentExist as keyof typeof SusComponents] as SusComponetsType, {
                                key: component.id,
                                id: { componentId: component.id, pageId: page.id },
                            });

                        return Component;
                    })}
                </>
            ),
        })),
        {
            path: `/${nextRouter.locale === nextRouter.defaultLocale ? "" : nextRouter.locale}`,
            element: <>Homepage</>,
        },
        {
            path: `*`,
            element: errorPage || <>Hehehe 404</>,
        },
    ]);

    return router;
};
