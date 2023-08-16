import { FC, Fragment, useReducer, useState } from "react";
import { trpc } from "../../src/utils/trpc";
import { CrossIconSvg, PlusSvg } from "../svg";
import { useClickOutside } from "@mantine/hooks";
import { Languages } from "@prisma/client";
import { useDetailPageStore } from "../../src/store/store";
import { useTranslation } from "next-i18next";
import { useActivePageLanguageStore } from "../../src/store/pages-store";

const ComponentsLanguageBar: FC<{
    pageId: string;
}> = ({ pageId }) => {
    const trpcCtx = trpc.useContext();

    const { t } = useTranslation("common");

    const { data: currentPage, isLoading } = trpc.useQuery(["auth.pages.getById", { id: pageId }]);

    const [languageDropdown, setLanguageDropdown] = useState<boolean>(false);
    const [deleteLanguagePopup, setDeleteLanguagePopup] = useState<boolean>(false);
    const [languageToDelete, setLanguageToDelete] = useState<string>("");

    const { pageActiveLanguage, setPageActiveLanguage } = useActivePageLanguageStore((state) => ({
        pageActiveLanguage: state.activePageLanguage,
        setPageActiveLanguage: state.setActivePageLanguage,
    }));

    const ref = useClickOutside(() => setLanguageDropdown(false));

    const { mutate: addLanguage } = trpc.useMutation(["auth.pages.addLanguageToCurrentPage"]);
    const { mutate: deleteLanguage } = trpc.useMutation(["auth.pages.deleteLanguageFromCurrentPage"]);

    const editState = useDetailPageStore((state) => state.editState);

    const addLanguageHandler = (language: string) => {
        const enumLanguage = Languages[language as keyof typeof Languages];

        addLanguage(
            { pageId, language: enumLanguage },
            {
                onSuccess: () => {
                    setLanguageDropdown(false);

                    trpcCtx.invalidateQueries(["auth.pages.getById", { id: pageId }]);
                },
            },
        );
    };

    const handleLanguageDelete = (language: string) => {
        const enumLanguage = Languages[language as keyof typeof Languages];

        deleteLanguage(
            { pageId, language: enumLanguage },
            {
                onSuccess: async () => {
                    setDeleteLanguagePopup(false);

                    trpcCtx.invalidateQueries(["auth.pages.getById", { id: pageId }]);
                },
            },
        );
    };

    if (isLoading) return <></>;

    return (
        <>
            <div className="components-language-bar">
                <ul>
                    {currentPage?.pageLanguages.map(({ language }, index) => (
                        <li key={index}>
                            <div className={`language-box${editState ? " is-active" : ""}`}>
                                <div className={`panel${pageActiveLanguage === language ? " is-active" : ""}`} onClick={() => setPageActiveLanguage(language)}>
                                    {language}
                                </div>
                                {language !== Languages.EN && (
                                    <button
                                        className="delete-box"
                                        onClick={() => {
                                            setLanguageToDelete(language);
                                            setDeleteLanguagePopup(true);
                                        }}
                                    >
                                        <CrossIconSvg />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                    <li>
                        <div ref={ref} className="add-language">
                            {currentPage?.pageLanguages.length !== Object.values(Languages).length && (
                                <button className="add-button" onClick={() => setLanguageDropdown((prev) => !prev)}>
                                    <PlusSvg />
                                </button>
                            )}
                            <div className={`language-dropdown${languageDropdown ? " is-active" : ""}`}>
                                <ul>
                                    {Object.values(Languages).map((language, index) => (
                                        <Fragment key={index}>
                                            {!currentPage?.pageLanguages.find((pageLanguage) => pageLanguage.language === language) && (
                                                <li key={index}>
                                                    <div className="language" onClick={() => addLanguageHandler(language)}>
                                                        {language}
                                                    </div>
                                                </li>
                                            )}
                                        </Fragment>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div className={`popup delete-language-popup${deleteLanguagePopup ? " is-active" : ""}`}>
                <div className="blur-background" onClick={() => setDeleteLanguagePopup(false)} />
                <div className="container">
                    <h2 className="headline h5">All data will be lost in {languageToDelete}. Are you sure u want to continue?</h2>
                    <div className="actions">
                        <button className="button is-primary delete-button" type="button" onClick={() => setDeleteLanguagePopup(false)}>
                            <span>{t("back")}</span>
                        </button>
                        <button className="button is-primary submit" type="button" onClick={() => handleLanguageDelete(languageToDelete)}>
                            <span>{t("delete")}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ComponentsLanguageBar;
