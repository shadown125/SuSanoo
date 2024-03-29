import { useState, type FC, type RefObject } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Form, Formik } from "formik";
import { useTranslation } from "next-i18next";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "react-beautiful-dnd";
import * as yup from "yup";
import shallow from "zustand/shallow";
import { useActivePageLanguageStore } from "../../src/store/pages-store";
import {
  useDetailPageStore,
  useNotificationStore,
} from "../../src/store/store";
import { type FormikSubmission } from "../../src/types/formik";
import AddAndUpdatePagePopup from "../page-list/add-and-update-page-popup";
import AddComponentItemPopup from "./add-component-item-popup";
import ComponentInput from "./component-input";
import ComponentsLanguageBar from "./components-language-bar";
import EditBar from "./edit-bar";
import EditComponentItemPopup from "./edit-component-item-popup";
import PageSEO from "./page-seo";

export const tabStates = {
  Components: "Components",
  PageSEO: "PageSEO",
} as const;

type ObjectValues<T> = T[keyof T];

export type TabStates = ObjectValues<typeof tabStates>;

const PageDetail: FC<{
  name: string;
  active: boolean;
  pageId: string;
  middleSectionRef: RefObject<HTMLDivElement>;
  pageRoute: string;
}> = ({ name, active, pageId, middleSectionRef, pageRoute }) => {
  const { setNotificationMessage, setNotificationState, setNotificationError } =
    useNotificationStore(
      (state) => ({
        setNotificationMessage: state.setNotificationMessage,
        setNotificationState: state.setNotificationState,
        setNotificationError: state.setNotificationError,
      }),
      shallow,
    );

  const [activeTab, setActiveTab] = useState<TabStates>(tabStates.Components);

  const activePageLanguage = useActivePageLanguageStore(
    (state) => state.activePageLanguage,
  );

  const {
    editState,
    setEditState,
    setComponentId,
    setAddComponentItemPopup,
    setUpdateComponentItemPopup,
    setComponentItemId,
  } = useDetailPageStore((state) => ({
    editState: state.editState,
    setEditState: state.setEditState,
    setComponentId: state.setComponentId,
    setAddComponentItemPopup: state.setAddComponentItemPopup,
    setUpdateComponentItemPopup: state.setUpdateComponentItemPopup,
    setComponentItemId: state.setComponentItemId,
  }));

  const ctx = api.useContext();
  const { t } = useTranslation("common");
  const { t: tPageSeo } = useTranslation("pages", {
    keyPrefix: "page-seo",
  });

  const router = useRouter();

  const { data: components, isLoading } =
    api.authPages.getCurrentPageComponents.useQuery({
      name,
      pageId,
    });
  const { data: pageInputsValues } = api.authPages.getPageInputsValues.useQuery(
    { pageId },
  );
  const { mutate: pageInputValue } =
    api.authPages.setNewPageInputValue.useMutation();
  const { mutate: setNewHistoryChangeLog } =
    api.authPages.setNewPageHistoryChangeLog.useMutation();
  const { mutate: deletePageComponent } =
    api.authPages.deletePageComponent.useMutation();
  const { mutate: updatePageComponentsIndex } =
    api.authPages.updatePageComponentsIndex.useMutation();

  const initialValues: Record<string, string> = {};

  const buildInitialValues = () => {
    components?.forEach((component) => {
      if (component.input.length <= 0) {
        return initialValues;
      }

      component.PageInputsValues.forEach((inputValue) => {
        inputValue.value.forEach((input) => {
          if (input.language === activePageLanguage) {
            initialValues[inputValue.id] = input.value;
          }
        });
      });
    });

    return initialValues;
  };

  const buildInputFieldConfigSchema = () => {
    const inputsFieldConfig: object[] = [];

    components?.forEach((component) => {
      if (component.input.length <= 0) {
        return inputsFieldConfig;
      }
      component.input.forEach(({ id, name, type, required }) => {
        const value = pageInputsValues?.find(
          (pageInputValue) => pageInputValue.inputId === id,
        );

        inputsFieldConfig.push({
          id: value ? value.id : id,
          label: name,
          placeholder: "",
          type: "text",
          validationType: type === "date" ? "date" : "string",
          required: required,
          value: undefined,
          validations: [
            required && {
              type: "required",
              params: [t("validation.required")],
            },
            type === "email" && {
              type: "email",
              params: [t("validation.email")],
            },
          ],
        });
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const yepSchema = inputsFieldConfig.reduce(buildValidationSchema, {});

    return yup.object().shape(yepSchema);
  };

  const submitHandler = (
    data: typeof initialValues,
    { setSubmitting }: FormikSubmission,
  ) => {
    try {
      for (const [key, value] of Object.entries(data)) {
        if (key !== "") {
          pageInputsValues?.forEach((pageInput) => {
            if (pageInput.id === key) {
              pageInputValue(
                {
                  inputId: key,
                  value: value,
                  language: activePageLanguage,
                },
                {
                  async onSuccess() {
                    await ctx.authPages.getCurrentPageComponents.invalidate();
                  },
                },
              );
            }
          });
        }
      }

      buildInitialValues();

      setNewHistoryChangeLog(
        {
          pageId,
        },
        {
          async onSuccess() {
            await ctx.authPages.getCurrentPageHistory.invalidate();
            await ctx.publicInputs.get.invalidate();
          },
        },
      );

      setNotificationMessage(t("pageSuccefullySaved"));
      setNotificationState(true);

      setTimeout(() => {
        setNotificationState(false);
      }, 3000);
      setTimeout(() => {
        setNotificationMessage("");
      }, 5000);

      setSubmitting(false);
      middleSectionRef.current?.scroll({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      setNotificationError(true);
      setNotificationMessage(t("somethingWentWrong"));
      setNotificationState(true);

      setTimeout(() => {
        setNotificationState(false);
      }, 3000);
      setTimeout(() => {
        setNotificationError(false);
        setNotificationMessage("");
      }, 5000);

      setSubmitting(false);

      middleSectionRef.current?.scroll({
        top: 0,
        behavior: "smooth",
      });

      throw new Error(error as string);
    }
  };

  const deletePageComponentHandler = (componentId: string) => {
    deletePageComponent(
      { componentId, pageId },
      {
        async onSuccess() {
          await ctx.authPages.getCurrentPageComponents.invalidate();
          await ctx.authPages.getCurrentPageHistory.invalidate();
          await ctx.authComponents.getAvaibleComponents.invalidate();

          setNotificationMessage(t("componentSuccefullyDeleted"));
          setNotificationState(true);

          setTimeout(() => {
            setNotificationState(false);
          }, 3000);
          setTimeout(() => {
            setNotificationMessage("");
          }, 5000);

          middleSectionRef.current?.scroll({
            top: 0,
            behavior: "smooth",
          });
        },
        onError: () => {
          setNotificationError(true);
          setNotificationMessage(t("somethingWentWrong"));
          setNotificationState(true);

          setTimeout(() => {
            setNotificationState(false);
          }, 3000);
          setTimeout(() => {
            setNotificationError(false);
            setNotificationMessage("");
          }, 5000);

          middleSectionRef.current?.scroll({
            top: 0,
            behavior: "smooth",
          });
        },
      },
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newComponents = Array.from(components!);

    const [removed] = newComponents.splice(source.index, 1);
    newComponents.splice(destination.index, 0, removed!);

    newComponents.forEach((component, index) => {
      if (component.index === undefined) {
        throw new Error("Components index is undefined. Something went wrong.");
      }

      updatePageComponentsIndex(
        {
          id: component.id,
          index,
        },
        {
          async onSuccess() {
            await ctx.authPages.getCurrentPageComponents.invalidate();
          },
        },
      );
    });
  };

  return (
    <>
      <div className="pages-detail">
        <div className="head">
          <h1 className="headline h1">{name}</h1>
          <div className="actions">
            <div className="row">
              <button
                className={`button is-tertiary${editState ? " is-active" : ""}`}
                onClick={() => setEditState(!editState)}
                type="button"
              >
                <span>{editState ? t("editPageIsActive") : t("editPage")}</span>
              </button>
              <div className={`status${active ? " active" : " inactive"}`}>
                <span className="label">
                  {active ? t("pages:active") : t("common:inactive")}
                </span>
              </div>
            </div>
            <a
              href={pageRoute}
              target="_blank"
              rel="noreferrer"
              className="button is-primary preview"
            >
              <span>{t("preview")}</span>
            </a>
          </div>
        </div>
        <EditBar pageId={pageId} active={active} pageRoute={pageRoute} />
        <ComponentsLanguageBar pageId={pageId} />
        <div className="tabs">
          <button
            className={`button is-secondary${
              activeTab === tabStates.Components ? " is-active" : ""
            }`}
            onClick={() => setActiveTab(tabStates.Components)}
            type="button"
          >
            <span>{tPageSeo("components")}</span>
          </button>
          <button
            className={`button is-secondary${
              activeTab === tabStates.PageSEO ? " is-active" : ""
            }`}
            onClick={() => setActiveTab(tabStates.PageSEO)}
            type="button"
          >
            <span>{tPageSeo("pageSeo")}</span>
          </button>
        </div>
        {activeTab === tabStates.PageSEO && (
          <PageSEO pageId={pageId} middleSectionRef={middleSectionRef} />
        )}
        {activeTab === tabStates.Components && (
          <>
            {!components || isLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="container">
                <Formik
                  enableReinitialize
                  initialValues={buildInitialValues()}
                  onSubmit={submitHandler}
                  validationSchema={buildInputFieldConfigSchema()}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      {components.length > 0 ? (
                        <DragDropContext onDragEnd={handleDragEnd}>
                          <Droppable droppableId="components-page-list">
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {components.map((component) => {
                                  let pageComponentIndex;
                                  let componentItemsExist = false;

                                  if (component.index !== undefined) {
                                    pageComponentIndex = component.index;
                                  } else {
                                    return (
                                      <div key={"loading"}>Loading...</div>
                                    );
                                  }

                                  if (
                                    component.componentItems.inputs.length > 0
                                  ) {
                                    componentItemsExist = true;
                                  }

                                  return (
                                    <Draggable
                                      key={component.id}
                                      draggableId={component.id.toString()}
                                      index={pageComponentIndex}
                                      isDragDisabled={!editState}
                                    >
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`component${
                                            editState ? " is-active" : ""
                                          }`}
                                        >
                                          <div className="head">
                                            {component.name}
                                          </div>
                                          <button
                                            className={`button delete-button is-primary${
                                              editState ? " is-active" : ""
                                            }`}
                                            onClick={() =>
                                              deletePageComponentHandler(
                                                component.id,
                                              )
                                            }
                                            type="button"
                                          >
                                            <span>Delete Component</span>
                                          </button>
                                          <ComponentInput
                                            pageId={pageId}
                                            pageComponentId={component.id}
                                          />
                                          <ul>
                                            {component.pageComponentsItem.map(
                                              ({ id, name }, index) => (
                                                <li
                                                  key={index}
                                                  className="page-component-item"
                                                  onClick={() => {
                                                    setUpdateComponentItemPopup(
                                                      true,
                                                    );
                                                    setComponentItemId(id);
                                                  }}
                                                >
                                                  {name}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                          {componentItemsExist && (
                                            <button
                                              className="button is-tertiary add-component-item"
                                              type="button"
                                              onClick={() => {
                                                setComponentId(component.id);
                                                setAddComponentItemPopup(true);
                                              }}
                                            >
                                              {t("addComponentItem")}
                                            </button>
                                          )}
                                        </div>
                                      )}
                                    </Draggable>
                                  );
                                })}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </DragDropContext>
                      ) : (
                        <div className="no-components">
                          <span>{t("noComponents")}</span>
                        </div>
                      )}
                      <div className="actions">
                        <button
                          className="button is-primary back"
                          type="button"
                          onClick={() => {
                            void router.push("/admin/pages");
                            setEditState(false);
                          }}
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
              </div>
            )}
          </>
        )}
      </div>
      <EditComponentItemPopup pageId={pageId} />
      <AddComponentItemPopup />
      <AddAndUpdatePagePopup update={true} pageId={pageId} />
    </>
  );
};

export default PageDetail;

// TODO: Fix types
/* eslint-disable */
export const buildValidationSchema = (schema: any, config: any) => {
  const { id, validationType, validations = [] } = config;

  if (!(yup as any)[validationType]) {
    return schema;
  }

  let validator = (yup as any)[validationType]();

  validations.forEach((validation: any) => {
    const { params, type } = validation;
    if (!validator[type]) {
      return;
    }
    validator = validator[type](...params);
  });

  schema[id] = validator;
  return schema;
};

const formatDate = (date: Date): string => {
  const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
  const month = `${date.getMonth() + 1 < 10 ? "0" : ""}${date.getMonth() + 1}`;
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};
