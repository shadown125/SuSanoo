import { DefaultSession } from "src/types/next-auth";

declare module "src/types/next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string;
    } & DefaultSession["user"];
  }
}
