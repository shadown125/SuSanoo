import { FC } from "react";
import { trpc } from "../../src/utils/trpc";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

const PageList: FC = () => {
    const { t } = useTranslation("");
    const router = useRouter();
    const { data: pages, isLoading } = trpc.useQuery(["auth.pages.get"]);

    return (
        <div className="page-list">
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
                                                        <Link href={`${router.pathname}/${name!.toLowerCase()}`}>
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
        </div>
    );
};

export default PageList;
