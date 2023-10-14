import { type FC } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { links } from "content/navigation/links";
import { signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import LanguageSwitch from "./language-switch";

const PageHeader: FC = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const currentRoute = links.filter((link) =>
    router.pathname.includes(link.path),
  );

  const { mutate: status } = api.auth.setUserStatus.useMutation();

  const logoutHandler = async (): Promise<void> => {
    status({ status: false });
    await signOut();
  };

  return (
    <header className="page-header">
      <div className="container">
        {router.pathname.includes(currentRoute[0]!.path) ? (
          <h1 className="headline h4">{currentRoute[0]!.name}</h1>
        ) : (
          <h1 className="headline h4">SuS</h1>
        )}
        <div className="content">
          <LanguageSwitch />
          <button className="button is-primary" onClick={void logoutHandler}>
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
