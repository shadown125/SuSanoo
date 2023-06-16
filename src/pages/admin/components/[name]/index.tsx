import { GetServerSideProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { useRef } from "react";
import i18n from "../../../../../next-i18next.config.mjs";
import Notification from "../../../../../elements/Notification";
import DefaultLayout from "../../../../../layouts/DefaultLayout";
import { getSuSAuthSession } from "../../../../server/common/get-server-session";
import { trpc } from "../../../../utils/trpc";
import { useTranslation } from "next-i18next";
import ComponentDetail from "../../../../../components/componentDetail/ComponentDetail";
import ComponentsHistory from "../../../../../components/history/ComponentsHistory";

const ComponentEdit: NextPage<{
    name: string;
}> = ({ name }) => {
    const { t } = useTranslation("common");
    const router = useRouter();
    const { data: components } = trpc.useQuery(["auth.components.get"], {
        select: (components) => components.filter((component) => component.name.toLowerCase() === name),
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
                            <ComponentDetail name={component.name} inputs={component.input} />
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
            name: ctx.params!.name,
        },
    };
};
