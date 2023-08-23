import { Form, Formik } from "formik";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { FC, RefObject, useState } from "react";
import * as yup from "yup";
import shallow from "zustand/shallow";
import { useNotificationStore, useDetailPageStore } from "../../src/store/store";
import { FormikSubmission } from "../../src/types/formik";
import { trpc } from "../../src/utils/trpc";
import ComponentInput from "./ComponentInput";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import EditBar from "./EditBar";
import AddAndUpdatePagePopup from "../pageList/AddAndUpdatePagePopup";
import ComponentsLanguageBar from "./ComponentsLanguageBar";
import { useActivePageLanguageStore } from "../../src/store/pages-store";
import PageSEO from "./PageSEO";

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
    const { setNotificationMessage, setNotificationState, setNotificationError } = useNotificationStore(
        (state) => ({
            setNotificationMessage: state.setNotificationMessage,
            setNotificationState: state.setNotificationState,
            setNotificationError: state.setNotificationError,
        }),
        shallow,
    );

    const [activeTab, setActiveTab] = useState<TabStates>(tabStates.Components);

    const activePageLanguage = useActivePageLanguageStore((state) => state.activePageLanguage);

    const editState = useDetailPageStore((state) => state.editState);
    const setEditState = useDetailPageStore((state) => state.setEditState);

    const trpcCtx = trpc.useContext();
    const { t } = useTranslation("common");
    const { t: tPageSeo } = useTranslation("pages", {
        keyPrefix: "page-seo",
    });

    const router = useRouter();

    const { data: components, isLoading } = trpc.useQuery([
        "auth.pages.getCurrentPageComponents",
        {
            name,
            pageId,
        },
    ]);
    const { data: pageInputsValues } = trpc.useQuery(["auth.pages.getPageInputsValues", { pageId }]);
    const { mutate: pageInputValue } = trpc.useMutation(["auth.pages.setNewPageInputValue"]);
    const { mutate: setNewHistoryChangeLog } = trpc.useMutation(["auth.pages.setNewPageHistoryChangeLog"]);
    const { mutate: deletePageComponent } = trpc.useMutation(["auth.pages.deletePageComponent"]);
    const { mutate: updatePageComponentsIndex } = trpc.useMutation(["auth.pages.updatePageComponentsIndex"]);

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
        const inputsFieldConfig: {}[] = [];

        components?.forEach((component) => {
            if (component.input.length <= 0) {
                return inputsFieldConfig;
            }
            component.input.forEach(({ id, name, type, required }) => {
                const value = pageInputsValues?.find((pageInputValue) => pageInputValue.inputId === id);

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

        const yepSchema = inputsFieldConfig.reduce(buildValidationSchema, {});

        return yup.object().shape(yepSchema);
    };

    const submitHandler = (data: typeof initialValues, { setSubmitting, resetForm }: FormikSubmission) => {
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
                                    onSuccess: () => {
                                        trpcCtx.invalidateQueries(["auth.pages.getCurrentPageComponents"]);
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
                    onSuccess: () => {
                        trpcCtx.invalidateQueries(["auth.pages.getCurrentPageHistory"]);
                        trpcCtx.invalidateQueries(["inputs.get"]);
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
                onSuccess: () => {
                    trpcCtx.invalidateQueries(["auth.pages.getCurrentPageComponents"]);
                    trpcCtx.invalidateQueries(["auth.pages.getCurrentPageHistory"]);
                    trpcCtx.invalidateQueries(["auth.components.getAvaibleComponents"]);

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

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
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
                    onSuccess: () => {
                        trpcCtx.invalidateQueries(["auth.pages.getCurrentPageComponents"]);
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
                            <button className={`button is-tertiary${editState ? " is-active" : ""}`} onClick={() => setEditState(!editState)} type="button">
                                <span>{editState ? t("editPageIsActive") : t("editPage")}</span>
                            </button>
                            <div className={`status${active ? " active" : " inactive"}`}>
                                <span className="label">{active ? t("pages:active") : t("common:inactive")}</span>
                            </div>
                        </div>
                        <a href={pageRoute} target="_blank" rel="noreferrer" className="button is-primary preview">
                            <span>{t("preview")}</span>
                        </a>
                    </div>
                </div>
                <EditBar pageId={pageId} active={active} pageRoute={pageRoute} />
                <ComponentsLanguageBar pageId={pageId} />
                <div className="tabs">
                    <button
                        className={`button is-secondary${activeTab === tabStates.Components ? " is-active" : ""}`}
                        onClick={() => setActiveTab(tabStates.Components)}
                        type="button"
                    >
                        <span>{tPageSeo("components")}</span>
                    </button>
                    <button className={`button is-secondary${activeTab === tabStates.PageSEO ? " is-active" : ""}`} onClick={() => setActiveTab(tabStates.PageSEO)} type="button">
                        <span>{tPageSeo("pageSeo")}</span>
                    </button>
                </div>
                {activeTab === tabStates.PageSEO && <PageSEO pageId={pageId} middleSectionRef={middleSectionRef} />}
                {activeTab === tabStates.Components && (
                    <>
                        {!components || isLoading ? (
                            <div>Loading...</div>
                        ) : (
                            <div className="container">
                                <Formik enableReinitialize initialValues={buildInitialValues()} onSubmit={submitHandler} validationSchema={buildInputFieldConfigSchema()}>
                                    {({ isSubmitting }) => (
                                        <Form>
                                            {components.length > 0 ? (
                                                <DragDropContext onDragEnd={handleDragEnd}>
                                                    <Droppable droppableId="components-page-list">
                                                        {(provided) => (
                                                            <div {...provided.droppableProps} ref={provided.innerRef}>
                                                                {components.map((component) => {
                                                                    let pageComponentIndex;

                                                                    if (component.index !== undefined) {
                                                                        pageComponentIndex = component.index;
                                                                    } else {
                                                                        return <div>Loading...</div>;
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
                                                                                    className={`component${editState ? " is-active" : ""}`}
                                                                                >
                                                                                    <div className="head">{component.name}</div>
                                                                                    <button
                                                                                        className={`button delete-button is-primary${editState ? " is-active" : ""}`}
                                                                                        onClick={() => deletePageComponentHandler(component.id)}
                                                                                        type="button"
                                                                                    >
                                                                                        <span>Delete Component</span>
                                                                                    </button>
                                                                                    <ComponentInput pageId={pageId} pageComponentId={component.id} />
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
                                                        router.push("/admin/pages");
                                                        setEditState(false);
                                                    }}
                                                >
                                                    <span>{t("back")}</span>
                                                </button>
                                                <button className="button is-primary submit" disabled={isSubmitting} type="submit">
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
            <AddAndUpdatePagePopup update={true} pageId={pageId} />
        </>
    );
};

export default PageDetail;

// TODO: Fix types
const buildValidationSchema = (schema: any, config: any) => {
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
