import { GetServerSideProps, NextPage } from "next";
import { getSuSAuthSession } from "../../../server/common/get-server-session";
import DefaultLayout from "../../../../layouts/DefaultLayout";
import UserList from "../../../../components/userList/UserList";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import i18n from "../../../../next-i18next.config.mjs";

const Panel: NextPage = () => {
    return (
        <DefaultLayout>
            <div className="middle-section">
                <section className="upper">
                    <h2 className="headline h5">middle</h2>
                </section>
                <UserList />
            </div>
            <div className="right-section">
                <section className="upper">
                    <h2 className="headline h5">col-right</h2>
                </section>
                <section className="lower">
                    <h2 className="headline h5">col-right</h2>
                </section>
            </div>
        </DefaultLayout>
    );
};

export default Panel;

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
            ...(await serverSideTranslations(ctx.locale!, ["common", "panel"], i18n)),
            session,
        },
    };
};
