import { Fragment, useState, type FC } from "react";
import { api } from "@/utils/api";
import { useClickOutside } from "@mantine/hooks";
import { Languages } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useActivePageLanguageStore } from "../../src/store/pages-store";
import { useDetailPageStore } from "../../src/store/store";
import { CrossIconSvg, PlusSvg } from "../svg";

const ComponentsLanguageBar: FC<{
  pageId: string;
}> = ({ pageId }) => {
  const ctx = api.useContext();

  const { t } = useTranslation("common");

  const { data: currentPage, isLoading } = api.authPages.getById.useQuery({
    id: pageId,
  });

  const [languageDropdown, setLanguageDropdown] = useState<boolean>(false);
  const [deleteLanguagePopup, setDeleteLanguagePopup] =
    useState<boolean>(false);
  const [languageToDelete, setLanguageToDelete] = useState<string>("");

  const { pageActiveLanguage, setPageActiveLanguage } =
    useActivePageLanguageStore((state) => ({
      pageActiveLanguage: state.activePageLanguage,
      setPageActiveLanguage: state.setActivePageLanguage,
    }));

  const ref = useClickOutside(() => setLanguageDropdown(false));

  const { mutate: addLanguage } =
    api.authPages.addLanguageToCurrentPage.useMutation();
  const { mutate: deleteLanguage } =
    api.authPages.deleteLanguageFromCurrentPage.useMutation();

  const editState = useDetailPageStore((state) => state.editState);

  const addLanguageHandler = (language: string) => {
    const enumLanguage = Languages[language as keyof typeof Languages];

    addLanguage(
      { pageId, language: enumLanguage },
      {
        async onSuccess() {
          setLanguageDropdown(false);

          await ctx.authPages.getById.invalidate({ id: pageId });
        },
      },
    );
  };

  const handleLanguageDelete = (language: string) => {
    const enumLanguage = Languages[language as keyof typeof Languages];

    deleteLanguage(
      { pageId, language: enumLanguage },
      {
        async onSuccess() {
          setDeleteLanguagePopup(false);

          await ctx.authPages.getById.invalidate({ id: pageId });
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
                <div
                  className={`panel${
                    pageActiveLanguage === language ? " is-active" : ""
                  }`}
                  onClick={() => setPageActiveLanguage(language)}
                >
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
              {currentPage?.pageLanguages.length !==
                Object.values(Languages).length && (
                <button
                  className="add-button"
                  onClick={() => setLanguageDropdown((prev) => !prev)}
                >
                  <PlusSvg />
                </button>
              )}
              <div
                className={`language-dropdown${
                  languageDropdown ? " is-active" : ""
                }`}
              >
                <ul>
                  {Object.values(Languages).map((language, index) => (
                    <Fragment key={index}>
                      {!currentPage?.pageLanguages.find(
                        (pageLanguage) => pageLanguage.language === language,
                      ) && (
                        <li key={index}>
                          <div
                            className="language"
                            onClick={() => addLanguageHandler(language)}
                          >
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
      <div
        className={`popup delete-language-popup${
          deleteLanguagePopup ? " is-active" : ""
        }`}
      >
        <div
          className="blur-background"
          onClick={() => setDeleteLanguagePopup(false)}
        />
        <div className="container">
          <h2 className="headline h5">
            All data will be lost in {languageToDelete}. Are you sure u want to
            continue?
          </h2>
          <div className="actions">
            <button
              className="button is-primary delete-button"
              type="button"
              onClick={() => setDeleteLanguagePopup(false)}
            >
              <span>{t("back")}</span>
            </button>
            <button
              className="button is-primary submit"
              type="button"
              onClick={() => handleLanguageDelete(languageToDelete)}
            >
              <span>{t("delete")}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComponentsLanguageBar;
