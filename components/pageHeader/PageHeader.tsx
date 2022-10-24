import { FC } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { links } from "../../content/navigation/links";
import { trpc } from "../../src/utils/trpc";
import LanguageSwitch from "../languageSwitch/LanguageSwitch";

const PageHeader: FC = () => {
    const router = useRouter();
    const currentRoute = links.filter((link) => router.pathname === link.path);

    const { mutate: status } = trpc.useMutation(["auth.setUserStatus"]);

    const logoutHandler = async (): Promise<void> => {
        await status({ status: false });
        await signOut();
    };

    return (
        <header className="page-header">
            <div className="container">
                <h1 className="headline h4">{currentRoute[0]!.name}</h1>
                <div className="content">
                    <LanguageSwitch />
                    <button className="button is-primary" onClick={logoutHandler}>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
