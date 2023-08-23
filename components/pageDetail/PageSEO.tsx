import { Formik, Form } from "formik";
import { FC, RefObject } from "react";
import { object, string } from "yup";
import TextField from "../../elements/inputFields/TextField";
import { useTranslation } from "next-i18next";
import TextAreaField from "../../elements/inputFields/TextAreaField";
import { useRouter } from "next/router";
import { useDetailPageStore, useNotificationStore } from "../../src/store/store";
import { FormikSubmission } from "../../src/types/formik";
import { trpc } from "../../src/utils/trpc";
import { useActivePageLanguageStore } from "../../src/store/pages-store";
import shallow from "zustand/shallow";

const validationSchema = object({
    title: string().max(60, "pageTitleMax").required("pageTitleRequired"),
    favicon: string().optional(),
    author: string().max(60, "pageAuthorMax").optional(),
    description: string().max(160, "pageDescriptionMax").optional(),
});

type submitHandlerValuesTypes = {
    title: string;
    favicon: string;
    author: string;
    description: string;
    twitterAuthor: string;
    twitterSite: string;
};

const PageSEO: FC<{
    pageId: string;
    middleSectionRef: RefObject<HTMLDivElement>;
}> = ({ pageId, middleSectionRef }) => {
    const { t } = useTranslation("pages");
    const { t: tPageSeo } = useTranslation("pages", {
        keyPrefix: "page-seo",
    });
    const { t: tCommon } = useTranslation("common");

    const { setNotificationMessage, setNotificationState, setNotificationError } = useNotificationStore(
        (state) => ({
            setNotificationMessage: state.setNotificationMessage,
            setNotificationState: state.setNotificationState,
            setNotificationError: state.setNotificationError,
        }),
        shallow,
    );

    const router = useRouter();
    const setEditState = useDetailPageStore((state) => state.setEditState);

    const activePageLanguage = useActivePageLanguageStore((state) => state.activePageLanguage);

    const { mutate: updateSeo } = trpc.useMutation(["auth.pages.updatePageSeo"]);
    const { data: pageSeo, isLoading } = trpc.useQuery(["auth.pages.getPageSeo", { pageId, language: activePageLanguage }]);

    const submitHandler = ({ title, favicon, author, description, twitterAuthor, twitterSite }: submitHandlerValuesTypes, { setSubmitting }: FormikSubmission) => {
        try {
            updateSeo({
                pageId,
                language: activePageLanguage,
                title,
                favicon,
                author,
                description,
                twitterAuthor,
                twitterSite,
            });

            setNotificationMessage(tCommon("pageSuccefullySaved"));
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

            setSubmitting(false);
        } catch (error) {
            setNotificationError(true);
            setNotificationMessage(tCommon("somethingWentWrong"));
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

            setSubmitting(false);

            throw new Error(error as string);
        }
    };

    if (isLoading) return <></>;

    return (
        <div className="page-seo">
            <Formik
                initialValues={{
                    title: pageSeo?.title as string,
                    favicon: pageSeo?.favicon as string,
                    author: pageSeo?.author as string,
                    description: pageSeo?.description as string,
                    twitterAuthor: pageSeo?.twitterAuthor as string,
                    twitterSite: pageSeo?.twitterSite as string,
                }}
                onSubmit={submitHandler}
                validationSchema={validationSchema}
                enableReinitialize
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div className="form-container">
                            <div className="row row-half title">
                                <label htmlFor="title">{tPageSeo("title")}</label>
                                <TextField name="title" />
                            </div>
                            <div className="row row-half favicon">
                                <label htmlFor="favicon">Favicon</label>
                                <TextField name="favicon" />
                            </div>
                            <div className="row author">
                                <label htmlFor="author">{tPageSeo("author")}</label>
                                <TextField name="author" />
                            </div>
                            <div className="row description">
                                <label htmlFor="description">{tPageSeo("description")}</label>
                                <TextAreaField name="description" />
                            </div>
                            <div className="row row-half twitter-author">
                                <label htmlFor="twitterAuthor">{tPageSeo("twitter-author")}</label>
                                <TextField name="twitterAuthor" />
                            </div>
                            <div className="row row-half twitter-site">
                                <label htmlFor="twitterSite">{tPageSeo("twitter-site")}</label>
                                <TextField name="twitterSite" />
                            </div>
                        </div>
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
    );
};

export default PageSEO;
