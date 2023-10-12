import { GetServerSideProps, NextPage } from "next";
import { getServerAuthSession } from "@/server/auth";
import ComponentsList from "components/components-list";
import CompleteHistory from "components/history/complete-history";
import UserList from "components/userList/user-list";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import DefaultLayout from "../../../../layouts/default-layout";
import i18n from "../../../../next-i18next.config.mjs";

const Components: NextPage = () => {
  return (
    <DefaultLayout>
      <div className="middle-section">
        <section className="upper">
          <ComponentsList />
        </section>
        <UserList />
      </div>
      <div className="right-section">
        <section className="upper">
          <h2 className="headline h5">Notifications</h2>
        </section>
        <section className="lower">
          <CompleteHistory />
        </section>
      </div>
    </DefaultLayout>
  );
};

export default Components;

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
    },
  };
};
