import { FC } from "react";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import { links } from "../../content/navigation/links";
import { trpc } from "../../src/utils/trpc";
import LanguageSwitch from "../languageSwitch/LanguageSwitch";
import { useTranslation } from "next-i18next";

const PageHeader: FC = () => {
    const { t } = useTranslation("common");
    const router = useRouter();
    const currentRoute = links.filter((link) => router.pathname.includes(link.path));

    const { mutate: status } = trpc.useMutation(["auth.setUserStatus"]);

    const logoutHandler = async (): Promise<void> => {
        status({ status: false });
        await signOut();
    };

    return (
        <header className="page-header">
            <div className="container">
                {router.pathname.includes(currentRoute[0]!.path) ? <h1 className="headline h4">{currentRoute[0]!.name}</h1> : <h1 className="headline h4">SuS</h1>}
                <div className="content">
                    <LanguageSwitch />
                    <button className="button is-primary" onClick={logoutHandler}>
                        <span>{t("logout")}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default PageHeader;
