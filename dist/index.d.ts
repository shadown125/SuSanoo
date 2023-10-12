import * as next from 'next';
import { DefaultSession, NextAuthOptions } from 'next-auth';
import { FC } from 'react';

declare const _default$1: next.NextComponentType;

declare const _default: next.NextApiHandler;

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
    interface Session extends DefaultSession {
        user: DefaultSession["user"] & {
            id: string;
        };
    }
}
/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
declare const authOptions: NextAuthOptions;

declare const SusanooProvider: FC<{
    errorPage?: JSX.Element | JSX.Element[];
}>;

declare const useSusInputs: ({ pageComponentId, pageId, language, }: {
    pageComponentId: string;
    pageId: string;
    language: string;
}) => {
    data: Record<string, string>;
    items: Record<string, string>[];
};

export { _default$1 as SusanooApp, SusanooProvider, authOptions, _default as createNextApiHandler, useSusInputs };
