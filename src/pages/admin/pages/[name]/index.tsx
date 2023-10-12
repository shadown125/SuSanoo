import { useRef } from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import AddComponent from "components/add-component";
import PageHistory from "components/history/page-history";
import PageDetail from "components/page-detail/page-detail";
import Notification from "elements/notification";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import DefaultLayout from "../../../../../layouts/default-layout";
import i18n from "../../../../../next-i18next.config.mjs";

const Edit: NextPage<{ name: string }> = ({ name }) => {
  const { t } = useTranslation("");
  const router = useRouter();
  const { data: pages } = api.authPages.get.useQuery(undefined, {
    select: (pages) => pages.filter((page) => page.name.toLowerCase() === name),
  });
  const middleSection = useRef<HTMLDivElement>(null);

  const page = pages ? pages[0] : null;

  return (
    <DefaultLayout grid={"one-two"}>
      {!page ? (
        <>
          <div className="middle-section">
            <section className="full">
              <h1 className="headline h1">{t("pages:doesNotExist")}</h1>
              <button className="button is-primary" onClick={router.back}>
                <span>Back button</span>
              </button>
            </section>
          </div>
          <div className="right-section">
            <section className="upper">
              <h2 className="headline h5">Add Component</h2>
            </section>
            <section className="lower">
              <h2 className="headline h5">{t("common:history")}</h2>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="middle-section">
            <section ref={middleSection} className="full">
              <Notification />
              <PageDetail
                pageRoute={page.route}
                pageId={page.id}
                name={page.name}
                active={page.active}
                middleSectionRef={middleSection}
              />
            </section>
          </div>
          <div className="right-section">
            <section className="upper">
              <AddComponent id={page.id} middleSectionRef={middleSection} />
            </section>
            <section className="lower">
              <PageHistory id={page.id} />
            </section>
          </div>
        </>
      )}
    </DefaultLayout>
  );
};

export default Edit;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session) {
    return {
      redirect: {
        destination: `/${ctx.locale}/admin`,
        permanent: false,
      },
    };
  }

  return {
    props: {
      ...(await serverSideTranslations(
        ctx.locale!,
        ["common", "panel", "pages", "admin"],
        i18n,
      )),
      session,
      name: ctx.params!.name,
    },
  };
};
