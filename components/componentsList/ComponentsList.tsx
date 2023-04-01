import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useComponentsStore } from "../../src/store/components-store";
import { trpc } from "../../src/utils/trpc";

const ComponentsList = () => {
    const { t } = useTranslation("");
    const router = useRouter();
    const { data: components } = trpc.useQuery(["auth.components.get"]);
    const setComponentId = useComponentsStore((state) => state.setComponentId);

    return (
        <div className="components-list">
            {!components ? (
                <div>Loading...</div>
            ) : (
                <>
                    {components!.length ? (
                        <div className="table-wrapper">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t("common:name")}</th>
                                        <th>{t("common:action")}</th>
                                    </tr>
                                </thead>
                                <motion.tbody layout>
                                    <AnimatePresence>
                                        {components.map((component, index) => {
                                            const { name, id } = component;

                                            return (
                                                <motion.tr layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} key={index}>
                                                    <th>{name}</th>
                                                    <td>
                                                        <div className="edit-button" onClick={() => setComponentId(id)}>
                                                            <Link href={`${router.pathname}/${name.toLowerCase()}`}>
                                                                <a className="button is-primary">
                                                                    <span>{t("common:edit")}</span>
                                                                </a>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </motion.tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-message">Currently there are no Components</div>
                    )}
                </>
            )}
        </div>
    );
};

export default ComponentsList;
