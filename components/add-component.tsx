import { FC, RefObject } from "react";
import { api } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { useActivePageLanguageStore } from "../src/store/pages-store";
import { useNotificationStore } from "../src/store/store";

const AddComponent: FC<{
  id: string;
  middleSectionRef: RefObject<HTMLDivElement>;
}> = ({ id, middleSectionRef }) => {
  const { setNotificationMessage, setNotificationState, setNotificationError } =
    useNotificationStore((state) => ({
      setNotificationMessage: state.setNotificationMessage,
      setNotificationState: state.setNotificationState,
      setNotificationError: state.setNotificationError,
    }));

  const apiCtx = api.useContext();
  const { t } = useTranslation("");
  const { data: components, refetch: componentsRefetch } =
    api.authComponents.getAvaibleComponents.useQuery({ pageId: id });

  const { mutate: addComponent } =
    api.authComponents.addToCurrentPage.useMutation();

  const activePageLanguage = useActivePageLanguageStore(
    (state) => state.activePageLanguage,
  );

  const addComponentHandler = async (componentId: string): Promise<void> => {
    addComponent(
      { componentId, pageId: id, language: activePageLanguage },
      {
        onSuccess: (_) => {
          apiCtx.authPages.getCurrentPageComponents.invalidate();
          apiCtx.authPages.getPageInputsValues.invalidate();

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
              <motion.li
                layout
                animate={{ opacity: 1 }}
                initial={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                key={component.id}
              >
                <div
                  className="component"
                  onClick={() => addComponentHandler(component.id)}
                >
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
