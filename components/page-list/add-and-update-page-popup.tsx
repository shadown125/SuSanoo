import { FC, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { FieldArray, Form, Formik, FormikValues } from "formik";
import { useTranslation } from "next-i18next";
import { object, string } from "yup";
import TextField from "../../elements/input-fields/text-field";
import { useAddAndUpdatePagePopupStore } from "../../src/store/pages-store";
import { FormikSubmission } from "../../src/types/formik";

const validationSchema = object({
  pageName: string().required().min(1).max(60),
});

const AddAndUpdatePagePopup: FC<{
  update?: boolean;
  pageId?: string;
}> = ({ update = false, pageId }) => {
  const { t } = useTranslation("");
  const ctx = api.useContext();
  const router = useRouter();

  const { data: components } = api.authComponents.get.useQuery();
  const { data: pages } = api.authPages.get.useQuery();
  const {
    data: currentPage,
    isLoading: currentPageIsLoading,
    isFetched: currentPageisFetched,
  } = api.authPages.getById.useQuery({
    id: pageId,
  });
  const {
    data: availablePageComponents,
    isLoading: availablePageComponentsIsLoading,
    isFetched: availablePageComponentsIsFetched,
  } = api.authPages.getPageAvailableComponents.useQuery({
    id: pageId,
  });
  const { mutate: createPage } = api.authPages.create.useMutation();
  const { mutate: updatePage } = api.authPages.updateCurrentPage.useMutation();

  const [addedComponents, setAddedComponents] = useState<
    { id: string; name: string }[]
  >([]);
  const [pageName, setPageName] = useState<string>("");
  const pagePathName = pageName
    .split(" ")
    .join("-")
    .replace(/[^a-zA-Z-^0-9]/g, "")
    .toLowerCase();

  const { popupState, setPopupState } = useAddAndUpdatePagePopupStore(
    (state) => ({
      popupState: state.popupState,
      setPopupState: state.setPopupState,
    }),
  );

  const [addComponentState, setAddComponentState] = useState<boolean>(false);
  const [nestPageState, setNestPageState] = useState<boolean>(false);
  const [nestedPageRoute, setNestedPageRoute] = useState<string>("");

  useEffect(() => {
    if (update && currentPageisFetched && currentPage) {
      setPageName(currentPage?.name);
      setNestedPageRoute(currentPage?.nestedPath || "");
    }
    if (update && availablePageComponentsIsFetched && availablePageComponents) {
      setAddedComponents(availablePageComponents);
    }
  }, [
    currentPageisFetched,
    update,
    currentPage,
    availablePageComponentsIsFetched,
    availablePageComponents,
  ]);

  const reset = () => {
    setPopupState(false);
    setAddComponentState(false);
    setNestPageState(false);
  };

  const submitHandler = (
    values: FormikValues,
    { setSubmitting, resetForm }: FormikSubmission,
  ) => {
    try {
      if (!update) {
        createPage(
          {
            name: pageName,
            components: values.components.map(
              (component: { id: string; name: string }) => component.id,
            ),
            route:
              pages?.length === 0
                ? "/"
                : `${
                    nestedPageRoute ? `${nestedPageRoute}` : ""
                  }/${pagePathName}`,
            nestedPath: nestedPageRoute,
          },
          {
            onSuccess: (_) => {
              ctx.authPages.get.invalidate();
              ctx.authComponents.get.invalidate();

              reset();
              setNestedPageRoute("");
              setPageName("");
              setAddedComponents([]);
            },
          },
        );
      } else {
        updatePage(
          {
            id: pageId,
            name: pageName,
            components: values.components.map(
              (component: { id: string; name: string }) => component.id,
            ),
            route: `${
              nestedPageRoute ? `${nestedPageRoute}` : ""
            }/${pagePathName}`,
            nestedPath: nestedPageRoute,
          },
          {
            onSuccess: (_) => {
              ctx.authPages.get.invalidate();
              ctx.authComponents.getAvaibleComponents.invalidate();

              reset();

              router.push(`/admin/pages/${pageName.toLowerCase()}`);
            },
          },
        );
      }

      resetForm(true);
      setSubmitting(false);
    } catch (error) {
      throw new Error(error as string);
    }
  };

  const addComponentHandler = (componentId: string) => {
    const component = components?.find(
      (component) => component.id === componentId,
    );

    if (component) {
      setAddedComponents((prevState) => [
        ...prevState,
        { id: component.id, name: component.name },
      ]);
    }
  };

  const removeComponentHandler = (componentId: string) => {
    setAddedComponents((prevState) =>
      prevState.filter((component) => component.id !== componentId),
    );
  };

  const filteredComponents =
    components?.filter(
      (component) =>
        !addedComponents.find(
          (addedComponent) => addedComponent.id === component.id,
        ),
    ) || [];

  return (
    <div
      className={`popup add-update-pages-popup${
        popupState ? " is-active" : ""
      }`}
    >
      <div
        className="blur-background"
        onClick={() => {
          setPopupState(false);
          setNestPageState(false);
          setAddComponentState(false);
        }}
      />
      <div className="container">
        {!components &&
        !pages &&
        currentPageIsLoading &&
        availablePageComponentsIsLoading ? (
          <div>Loading...</div>
        ) : (
          <>
            {popupState && !addComponentState && !nestPageState && (
              <>
                <h2 className="headline h4">{t("pages:addNewPage")}</h2>
                {pages?.length === 0 && (
                  <div className="home-page-alert">
                    {t("pages:homePageAlert")}
                  </div>
                )}
                <h3 className="headline h6">
                  {t("pages:generatedRoute")}:&quot;
                  <span className="generated-route">
                    {pages?.length === 0 || currentPage?.route === "/" ? (
                      <>/</>
                    ) : (
                      <>
                        {nestedPageRoute ? (
                          <>
                            <span className="nested-page-name">{`${nestedPageRoute}/`}</span>
                            {pagePathName}
                          </>
                        ) : (
                          `/${pagePathName}`
                        )}
                      </>
                    )}
                  </span>
                  &quot;
                </h3>
                <Formik
                  enableReinitialize={true}
                  initialValues={{
                    pageName: pageName,
                    components: addedComponents,
                  }}
                  onSubmit={submitHandler}
                  validationSchema={validationSchema}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <div className="row">
                        <label htmlFor="name">{t("admin:pageName")}:</label>
                        <TextField
                          name="pageName"
                          getValue={setPageName}
                          value={pageName}
                        />
                      </div>
                      {pages?.length !== 0 && (
                        <div className="row">
                          <button
                            className="button is-tertiary"
                            type="button"
                            onClick={() => setNestPageState(true)}
                          >
                            {t("pages:nestPage")}
                          </button>
                        </div>
                      )}
                      <FieldArray
                        name="components"
                        render={() => (
                          <div className="components-container">
                            <button
                              className="button is-tertiary add-component-button"
                              type="button"
                              onClick={() => setAddComponentState(true)}
                            >
                              {t("pages:addComponent")}
                            </button>
                            <h4 className="headline h6">
                              {t("pages:pageComponents")}:
                            </h4>
                            {addedComponents?.length > 0 ? (
                              <ul className="components-list">
                                {addedComponents.map((component) => (
                                  <li
                                    key={component.id}
                                    onClick={() =>
                                      removeComponentHandler(component.id)
                                    }
                                  >
                                    {component.name}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="no-components-added">
                                {t("pages:noComponentsAdded")}
                              </p>
                            )}
                          </div>
                        )}
                      />
                      <div className="actions">
                        <button
                          className="button is-primary back"
                          type="button"
                          onClick={() => setPopupState(false)}
                        >
                          <span>{t("back")}</span>
                        </button>
                        <button
                          className="button is-primary submit"
                          disabled={isSubmitting}
                          type="submit"
                        >
                          <span>{t("save")}</span>
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </>
            )}
            {addComponentState && (
              <>
                <h2 className="headline h5">{t("pages:addComponentToPage")}</h2>
                <div className="components-add-container">
                  <ul className="components-list">
                    {filteredComponents?.length > 0 ? (
                      <>
                        {filteredComponents?.map((component) => (
                          <li
                            key={component.id}
                            onClick={() => addComponentHandler(component.id)}
                          >
                            {component.name}
                          </li>
                        ))}
                      </>
                    ) : (
                      <li className="not-found">
                        {t("pages:avaibleComponents")}
                      </li>
                    )}
                  </ul>
                  <div className="actions">
                    <button
                      className="button is-primary back"
                      type="button"
                      onClick={() => setAddComponentState(false)}
                    >
                      <span>{t("done")}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            {nestPageState && (
              <>
                <h2 className="headline h5">{t("pages:nestPage")}</h2>
                <div className="pages-container">
                  <ul className="pages-list">
                    {pages?.length || 0 > 0 ? (
                      <>
                        {pages
                          ?.filter(
                            (page) => page.id !== pageId && page.route !== "/",
                          )
                          .map((page) => (
                            <li
                              key={page.id}
                              onClick={() => {
                                if (
                                  page.nestedPath === nestedPageRoute &&
                                  page.nestedPath !== ""
                                ) {
                                  setNestedPageRoute("");
                                  return;
                                }
                                setNestedPageRoute(page.route);
                              }}
                              className={`${
                                page.route === nestedPageRoute
                                  ? "is-active"
                                  : ""
                              }`}
                            >
                              {page.name}
                            </li>
                          ))}
                      </>
                    ) : (
                      <li className="not-found">
                        {t("pages:avaibleNestedPages")}
                      </li>
                    )}
                  </ul>
                  <div className="actions">
                    <button
                      className="button is-primary back"
                      type="button"
                      onClick={() => setNestPageState(false)}
                    >
                      <span>{t("common:done")}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AddAndUpdatePagePopup;
