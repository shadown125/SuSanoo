import { FC } from "react";
import { trpc } from "../../src/utils/trpc";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAddPagePopupStore } from "../../src/store/pages-store";
import AddPagePopup from "./AddPagePopup";

const PageList: FC = () => {
    const { t } = useTranslation("");
    const router = useRouter();
    const { data: pages, isLoading } = trpc.useQuery(["auth.pages.get"]);

    const { setAddPagePopupOpen } = useAddPagePopupStore((state) => ({
        setAddPagePopupOpen: state.setPopupOpen,
    }));

    return (
        <div className="page-list">
            <div className="actions">
                <button className="button is-tertiary" onClick={() => setAddPagePopupOpen(true)}>
                    {t("pages:addPage")}
                </button>
            </div>
            {!pages && isLoading ? (
                <div>Loading....</div>
            ) : (
                <>
                    {pages!.length ? (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t("common:name")}</th>
                                        <th>{t("common:created")}</th>
                                        <th>{t("common:status")}</th>
                                        <th>{t("common:action")}</th>
                                    </tr>
                                </thead>
                                <motion.tbody layout>
                                    <AnimatePresence>
                                        {pages!.map((page, index) => {
                                            const { name, createdAt, active } = page;

                                            return (
                                                <motion.tr layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} key={index}>
                                                    <th>{name}</th>
                                                    <td>{createdAt.toLocaleDateString()}</td>
                                                    <td className={`status ${active ? "active" : "inactive"}`}>
                                                        <span className="label">{active ? t("pages:active") : t("common:inactive")}</span>
                                                    </td>
                                                    <td>
                                                        <Link href={`${router.pathname}/${name.toLowerCase()}`}>
                                                            <a className="button is-primary">
                                                                <span>{t("common:edit")}</span>
                                                            </a>
                                                        </Link>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-message">{t("panel:currently")} there are no pages</div>
                    )}
                </>
            )}
            <AddPagePopup />
        </div>
    );
};

export default PageList;
