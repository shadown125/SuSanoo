import { FC } from "react";
import { trpc } from "../../src/utils/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "next-i18next";

const AddComponent: FC<{
    id: string;
}> = ({ id }) => {
    const trpcCtx = trpc.useContext();
    const { t } = useTranslation("pages");
    const { data: components, refetch: componentsRefetch } = trpc.useQuery([
        "auth.components.getAvaibleComponents",
        {
            pageId: id,
        },
    ]);
    const { mutate: addComponent } = trpc.useMutation(["auth.components.addToCurrentPage"]);

    const addComponentHandler = async (componentId: string): Promise<void> => {
        addComponent(
            { componentId, pageId: id },
            {
                onSuccess: (_) => {
                    trpcCtx.invalidateQueries(["auth.pages.getCurrentPageComponents"]);
                    trpcCtx.invalidateQueries(["auth.pages.getPageInputsValues"]);
                    componentsRefetch();
                },
            },
        );
    };

    return (
        <div className="add-component">
            <h2 className="headline h5">{t("addComponent")}</h2>
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
