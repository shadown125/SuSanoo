import { withTRPC } from "@trpc/next";
import { SessionProvider } from "next-auth/react";
import { AppType } from "next/dist/shared/lib/utils";
import { AppRouter } from "../../src/server/router";
import HeadPage from "../headPage/HeadPage";
import superjson from "superjson";
import { appWithTranslation } from "next-i18next";

const SusanooApp: AppType = ({ Component, pageProps: { session, ...pageProps } }) => {
    return (
        <SessionProvider session={session}>
            <HeadPage />
            <div className="app">
                <Component {...pageProps} />
            </div>
        </SessionProvider>
    );
};

const getBaseUrl = () => {
    if (typeof window !== "undefined") {
        return "";
    }
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

    return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export default withTRPC<AppRouter>({
    config({ ctx }) {
        /**
         * If you want to use SSR, you need to use the server's full URL
         * @link https://trpc.io/docs/ssr
         */
        const url = `${getBaseUrl()}/api/trpc`;

        return {
            url,
            transformer: superjson,
            /**
             * @link https://react-query.tanstack.com/reference/QueryClient
             */
            // queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
        };
    },
    /**
     * @link https://trpc.io/docs/ssr
     */
    ssr: false,
    //@ts-ignore
})(appWithTranslation(SusanooApp));
