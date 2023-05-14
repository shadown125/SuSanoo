import { GetServerSideProps, NextPage } from "next";
import DefaultLayout from "../../../../../layouts/DefaultLayout";
import { getSuSAuthSession } from "../../../../server/common/get-server-session";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import i18n from "../../../../../next-i18next.config.mjs";
import { useRouter } from "next/router";
import { trpc } from "../../../../utils/trpc";
import PageHistory from "../../../../../components/history/PageHistory";
import { useTranslation } from "next-i18next";
import PageDetail from "../../../../../components/pageDetail/PageDetail";
import AddComponent from "../../../../../components/addComponent/AddComponent";
import Notification from "../../../../../elements/Notification";
import { useRef } from "react";

const Edit: NextPage<{ name: string }> = ({ name }) => {
    const { t } = useTranslation("");
    const router = useRouter();
    const { data: pages } = trpc.useQuery(["auth.pages.get"], {
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
                            <PageDetail pageId={page.id} name={page.name} active={page.active} middleSectionRef={middleSection} />
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
