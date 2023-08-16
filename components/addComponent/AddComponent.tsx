import { FC, RefObject } from "react";
import { trpc } from "../../src/utils/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useNotificationStore } from "../../src/store/store";
import shallow from "zustand/shallow";
import { useActivePageLanguageStore } from "../../src/store/pages-store";

const AddComponent: FC<{
    id: string;
    middleSectionRef: RefObject<HTMLDivElement>;
}> = ({ id, middleSectionRef }) => {
    const { setNotificationMessage, setNotificationState, setNotificationError } = useNotificationStore(
        (state) => ({
            setNotificationMessage: state.setNotificationMessage,
            setNotificationState: state.setNotificationState,
            setNotificationError: state.setNotificationError,
        }),
        shallow,
    );

    const trpcCtx = trpc.useContext();
    const { t } = useTranslation("");
    const { data: components, refetch: componentsRefetch } = trpc.useQuery([
        "auth.components.getAvaibleComponents",
        {
            pageId: id,
        },
    ]);
    const { mutate: addComponent } = trpc.useMutation(["auth.components.addToCurrentPage"]);

    const activePageLanguage = useActivePageLanguageStore((state) => state.activePageLanguage);

    const addComponentHandler = async (componentId: string): Promise<void> => {
        addComponent(
            { componentId, pageId: id, language: activePageLanguage },
            {
                onSuccess: (_) => {
                    trpcCtx.invalidateQueries(["auth.pages.getCurrentPageComponents"]);
                    trpcCtx.invalidateQueries(["auth.pages.getPageInputsValues"]);
                    componentsRefetch();

                    setNotificationMessage(t("common:componentSuccefullyAddedToPage"));
                    setNotificationState(true);

                    setTimeout(() => {
                        setNotificationState(false);
                    }, 3000);
                    setTimeout(() => {
                        setNotificationMessage("");
                    }, 5000);

                    middleSectionRef.current?.scroll(0, 0);
                },
                onError: (_) => {
                    setNotificationError(true);
                    setNotificationMessage(t("common:somethingWentWrong"));
                    setNotificationState(true);

                    setTimeout(() => {
                        setNotificationState(false);
                    }, 3000);
                    setTimeout(() => {
                        setNotificationError(false);
                        setNotificationMessage("");
                    }, 5000);

                    middleSectionRef.current?.scroll(0, 0);
                },
            },
        );
    };

    return (
        <div className="add-component">
            <h2 className="headline h5">{t("pages:addComponent")}</h2>
            {!components ? (
                <p>Loading...</p>
            ) : (
                <motion.ul layout className="components-list">
                    <AnimatePresence>
                        {components.map((component) => (
                            <motion.li layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} key={component.id}>
                                <div className="component" onClick={() => addComponentHandler(component.id)}>
                                    <div className="name">{component.name}</div>
                                </div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            )}
        </div>
    );
};

export default AddComponent;
