import { GetServerSideProps, NextPage } from "next";
import DefaultLayout from "../../../../layouts/DefaultLayout";
import { getSuSAuthSession } from "../../../server/common/get-server-session";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import i18n from "../../../../next-i18next.config.mjs";
import UserList from "../../../../components/userList/UserList";
import CompleteHistory from "../../../../components/history/CompleteHistory";
import ComponentsList from "../../../../components/componentsList/ComponentsList";

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
    const session = await getSuSAuthSession(ctx);

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
            ...(await serverSideTranslations(ctx.locale!, ["common", "panel", "pages", "admin"], i18n)),
            session,
        },
    };
};
