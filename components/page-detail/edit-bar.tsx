import { useState, type FC } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { useTranslation } from "next-i18next";
import Switch from "react-switch";
import { useAddAndUpdatePagePopupStore } from "../../src/store/pages-store";
import { useDetailPageStore } from "../../src/store/store";

const EditBar: FC<{
  pageId: string;
  active: boolean;
  pageRoute: string;
}> = ({ pageId, active, pageRoute }) => {
  const { t } = useTranslation("common");
  const { t: tPage } = useTranslation("pages");
  const [deletePagePopup, setDeletePagePopup] = useState(false);
  const router = useRouter();

  const ctx = api.useContext();

  const { mutate: deletePage } = api.authPages.delete.useMutation();
  const { mutate: updatePageActive } =
    api.authPages.updateActiveState.useMutation();

  const { editState, setEditState } = useDetailPageStore((state) => ({
    setEditState: state.setEditState,
    editState: state.editState,
  }));

  const setUpdatePopupState = useAddAndUpdatePagePopupStore(
    (state) => state.setPopupState,
  );

  const handlePageDelete = () => {
    deletePage(
      { id: pageId },
      {
        async onSuccess() {
          router.back();
          setEditState(false);
          setDeletePagePopup(false);

          await ctx.authPages.get.invalidate();
        },
      },
    );
  };

  const handleSwitch = () => {
    updatePageActive(
      {
        id: pageId,
        active: !active,
      },
      {
        async onSuccess() {
          await ctx.authPages.get.invalidate();
        },
      },
    );
  };

  return (
    <>
      <div className={`edit-bar${editState ? " is-active" : ""}`}>
        <div className="edit-actions">
          <button
            className="button is-primary delete"
            disabled={pageRoute !== "/" ? false : true}
            onClick={() => pageRoute !== "/" && setDeletePagePopup(true)}
          >
            {t("deletePage")}
          </button>
          <button
            className="button is-primary"
            onClick={() => setUpdatePopupState(true)}
          >
            {tPage("editOptions")}
          </button>
        </div>
        <div className="switch-container">
          <div className="text">{tPage("switchPageMode")}:</div>
          <Switch
            onChange={handleSwitch}
            checked={active}
            uncheckedIcon={false}
            checkedIcon={false}
            onColor="#68e359"
          />
        </div>
      </div>
      <div
        className={`popup edit-bar-popup${deletePagePopup ? " is-active" : ""}`}
      >
        <div
          className="blur-background"
          onClick={() => setDeletePagePopup(false)}
        />
        <div className="container">
          <h2 className="headline h5">{tPage("deletePageQuestion")}</h2>
          <p className="text">{tPage("deletePageWarning")}</p>
          <div className="actions">
            <button
              className="button is-primary"
              onClick={() => setDeletePagePopup(false)}
            >
              {t("no")}
            </button>
            <button
              className="button is-primary delete"
              onClick={handlePageDelete}
            >
              {t("yes")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBar;
