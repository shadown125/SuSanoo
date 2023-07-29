import { useTranslation } from "next-i18next";
import { FC, useState } from "react";
import { trpc } from "../../src/utils/trpc";
import { useRouter } from "next/router";
import { useDetailPageStore } from "../../src/store/store";
import Switch from "react-switch";
import { useAddAndUpdatePagePopupStore } from "../../src/store/pages-store";

const EditBar: FC<{
    pageId: string;
    active: boolean;
    pageRoute: string;
}> = ({ pageId, active, pageRoute }) => {
    const { t } = useTranslation("common");
    const { t: tPage } = useTranslation("pages");
    const [deletePagePopup, setDeletePagePopup] = useState(false);
    const router = useRouter();

    const context = trpc.useContext();
    const { mutate: deletePage } = trpc.useMutation(["auth.pages.delete"]);
    const { mutate: updatePageActive } = trpc.useMutation(["auth.pages.updateActiveState"]);

    const { editState, setEditState } = useDetailPageStore((state) => ({
        setEditState: state.setEditState,
        editState: state.editState,
    }));

    const setUpdatePopupState = useAddAndUpdatePagePopupStore((state) => state.setPopupState);

    const handlePageDelete = () => {
        deletePage(
            { id: pageId },
            {
                onSuccess: () => {
                    router.back();
                    setEditState(false);
                    setDeletePagePopup(false);

                    context.invalidateQueries(["auth.pages.get"]);
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
                onSuccess: () => {
                    context.invalidateQueries(["auth.pages.get"]);
                },
            },
        );
    };

    console.log(pageRoute);

    return (
        <>
            <div className={`edit-bar${editState ? " is-active" : ""}`}>
                <div className="edit-actions">
                    <button className="button is-primary delete" disabled={pageRoute !== "/" ? false : true} onClick={() => pageRoute !== "/" && setDeletePagePopup(true)}>
                        {t("deletePage")}
                    </button>
                    <button className="button is-primary" onClick={() => setUpdatePopupState(true)}>
                        {tPage("editOptions")}
                    </button>
                </div>
                <div className="switch-container">
                    <div className="text">{tPage("switchPageMode")}:</div>
                    <Switch onChange={handleSwitch} checked={active} uncheckedIcon={false} checkedIcon={false} onColor="#68e359" />
                </div>
            </div>
            <div className={`popup edit-bar-popup${deletePagePopup ? " is-active" : ""}`}>
                <div className="blur-background" onClick={() => setDeletePagePopup(false)} />
                <div className="container">
                    <h2 className="headline h5">{tPage("deletePageQuestion")}</h2>
                    <p className="text">{tPage("deletePageWarning")}</p>
                    <div className="actions">
                        <button className="button is-primary" onClick={() => setDeletePagePopup(false)}>
                            {t("no")}
                        </button>
                        <button className="button is-primary delete" onClick={handlePageDelete}>
                            {t("yes")}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditBar;
