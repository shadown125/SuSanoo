import { FC, useState } from "react";
import { useAddPagePopupStore } from "../../src/store/pages-store";
import { FieldArray, Form, Formik, FormikValues } from "formik";
import { FormikSubmission } from "../../src/types/formik";
import { useTranslation } from "next-i18next";
import TextField from "../../elements/inputFields/TextField";
import { trpc } from "../../src/utils/trpc";
import { object, string } from "yup";

const validationSchema = object({
    pageName: string().required().min(1).max(60),
});

const AddPagePopup: FC = () => {
    const { t } = useTranslation("");
    const context = trpc.useContext();

    const { data: components } = trpc.useQuery(["auth.components.get"]);
    const { data: pages } = trpc.useQuery(["auth.pages.get"]);
    const { mutate: createPage } = trpc.useMutation(["auth.pages.create"]);

    const [addedComponents, setAddedComponents] = useState<{ id: string; name: string }[]>([]);
    const [pagePathName, setPagePathName] = useState<string>("");

    const { addPagePopupOpen, setAddPagePopupOpen } = useAddPagePopupStore((state) => ({
        addPagePopupOpen: state.popupOpen,
        setAddPagePopupOpen: state.setPopupOpen,
    }));
    const [addComponentState, setAddComponentState] = useState<boolean>(false);
    const [nestPageState, setNestPageState] = useState<boolean>(false);
    const [nestedPageRoute, setNestedPageRoute] = useState<string>("");

    const submitHandler = (values: FormikValues, { setSubmitting, resetForm }: FormikSubmission) => {
        try {
            createPage(
                {
                    name: values.pageName,
                    components: values.components.map((component: { id: string; name: string }) => component.id),
                    route: `${nestedPageRoute ? `${nestedPageRoute}/` : ""}${pagePathName}`,
                },
                {
                    onSuccess: (_) => {
                        context.invalidateQueries(["auth.pages.get"]);
                        context.invalidateQueries(["auth.components.get"]);

                        setAddPagePopupOpen(false);
                        setAddComponentState(false);
                        setNestPageState(false);
                        setNestedPageRoute("");
                        setPagePathName("");
                        setAddedComponents([]);
                    },
                },
            );
            setSubmitting(false);
            resetForm(true);
        } catch (error) {
            throw new Error(error as string);
        }
    };

    const addComponentHandler = (componentId: string) => {
        const component = components?.find((component) => component.id === componentId);

        if (component) {
            setAddedComponents((prevState) => [...prevState, { id: component.id, name: component.name }]);
        }
    };

    const removeComponentHandler = (componentId: string) => {
        setAddedComponents((prevState) => prevState.filter((component) => component.id !== componentId));
    };

    const filteredComponents = components?.filter((component) => !addedComponents.find((addedComponent) => addedComponent.id === component.id)) || [];

    return (
        <div className={`popup${addPagePopupOpen ? " is-active" : ""}`}>
            <div
                className="blur-background"
                onClick={() => {
                    setAddPagePopupOpen(false);
                    setNestPageState(false);
                    setAddComponentState(false);
                }}
            />
            <div className="container">
                {!components && !pages ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        {addPagePopupOpen && !addComponentState && !nestPageState && (
                            <>
                                <h2 className="headline h4">{t("pages:addNewPage")}</h2>
                                <h3 className="headline h6">
                                    {t("pages:generatedRoute")}:&quot;
                                    <span className="generated-route">
                                        {nestedPageRoute ? (
                                            <>
                                                <span className="nested-page-name">{`/${nestedPageRoute}/`}</span>
                                                {pagePathName}
                                            </>
                                        ) : (
                                            `/${pagePathName}`
                                        )}
                                    </span>
                                    &quot;
                                </h3>
                                <Formik
                                    enableReinitialize={true}
                                    initialValues={{ pageName: pagePathName, components: addedComponents }}
                                    onSubmit={submitHandler}
                                    validationSchema={validationSchema}
                                >
                                    {({ isSubmitting }) => (
                                        <Form>
                                            <div className="row">
                                                <label htmlFor="name">{t("admin:pageName")}:</label>
                                                <TextField name="pageName" getValue={setPagePathName} value={pagePathName} />
                                            </div>
                                            <div className="row">
                                                <button className="button is-tertiary" onClick={() => setNestPageState(true)}>
                                                    {t("pages:nestPage")}
                                                </button>
                                            </div>
                                            <FieldArray
                                                name="components"
                                                render={() => (
                                                    <div className="components-container">
                                                        <button className="button is-tertiary add-component-button" onClick={() => setAddComponentState(true)}>
                                                            {t("pages:addComponent")}
                                                        </button>
                                                        <h4 className="headline h6">{t("pages:pageComponents")}:</h4>
                                                        {addedComponents?.length > 0 ? (
                                                            <ul className="components-list">
                                                                {addedComponents.map((component) => (
                                                                    <li key={component.id} onClick={() => removeComponentHandler(component.id)}>
                                                                        {component.name}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <p className="no-components-added">{t("pages:noComponentsAdded")}</p>
                                                        )}
                                                    </div>
                                                )}
                                            />
                                            <div className="actions">
                                                <button className="button is-primary back" type="button" onClick={() => setAddPagePopupOpen(false)}>
                                                    <span>{t("back")}</span>
                                                </button>
                                                <button className="button is-primary submit" disabled={isSubmitting} type="submit">
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
                                                    <li key={component.id} onClick={() => addComponentHandler(component.id)}>
                                                        {component.name}
                                                    </li>
                                                ))}
                                            </>
                                        ) : (
                                            <li className="not-found">{t("pages:avaibleComponents")}</li>
                                        )}
                                    </ul>
                                    <div className="actions">
                                        <button className="button is-primary back" type="button" onClick={() => setAddComponentState(false)}>
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
                                                {pages?.map((page) => (
                                                    <li
                                                        key={page.id}
                                                        onClick={() => {
                                                            if (page.route === nestedPageRoute) {
                                                                setNestedPageRoute("");
                                                                return;
                                                            }
                                                            setNestedPageRoute(page.route);
                                                        }}
                                                        className={`${page.route === nestedPageRoute ? "is-active" : ""}`}
                                                    >
                                                        {page.name}
                                                    </li>
                                                ))}
                                            </>
                                        ) : (
                                            <li className="not-found">{t("pages:avaibleNestedPages")}</li>
                                        )}
                                    </ul>
                                    <div className="actions">
                                        <button className="button is-primary back" type="button" onClick={() => setNestPageState(false)}>
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

export default AddPagePopup;
