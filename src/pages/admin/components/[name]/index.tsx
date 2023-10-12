import { useRef } from "react";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/utils/api";
import ComponentDetail from "components/component-detail/component-detail";
import ComponentsHistory from "components/history/components-history";
import Notification from "elements/notification";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import DefaultLayout from "../../../../../layouts/default-layout";
import i18n from "../../../../../next-i18next.config.mjs";

const ComponentEdit: NextPage<{
  name: string;
}> = ({ name }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { data: components } = api.authComponents.get.useQuery(undefined, {
    select: (components) =>
      components.filter((component) => component.name.toLowerCase() === name),
  });
  const middleSection = useRef<HTMLDivElement>(null);

  const component = components ? components[0] : null;

  return (
    <DefaultLayout grid={"one-two"}>
      {!component ? (
        <>
          <div className="middle-section">
            <section className="full">
              <h1 className="headline h1">{t("componentNotFound")}</h1>
              <button className="button is-primary" onClick={router.back}>
                <span>Back button</span>
              </button>
            </section>
          </div>
          <div className="right-section">
            <section className="upper">
              <h2 className="headline h5">{t("addComponent")}</h2>
            </section>
            <section className="lower">
              <h2 className="headline h5">{t("history")}</h2>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="middle-section">
            <section ref={middleSection} className="full">
              <Notification />
              <ComponentDetail
                componentKey={component.key}
                name={component.name}
                inputs={component.input}
              />
            </section>
          </div>
          <div className="right-section">
            <section className="upper"></section>
            <section className="lower">
              <ComponentsHistory id={component.id} />
            </section>
          </div>
        </>
      )}
    </DefaultLayout>
  );
};

export default ComponentEdit;

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
