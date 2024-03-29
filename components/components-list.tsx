import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Form, Formik } from "formik";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import { object, string } from "yup";
import TextField from "../elements/input-fields/text-field";
import { useComponentsStore } from "../src/store/components-store";

const validationSchema = object({
  componentName: string()
    .required("componentNameRequired")
    .max(50, "componentNameTooLong"),
});

const ComponentsList = () => {
  const { t } = useTranslation("");
  const router = useRouter();
  const { data: components } = api.authComponents.get.useQuery();
  const { mutate: createComponent } = api.authComponents.create.useMutation();

  const setComponentId = useComponentsStore((state) => state.setComponentId);

  const [addComponentPopupOpen, setAddComponentPopupOpen] =
    useState<boolean>(false);

  const submitHandler = (values: { componentName: string }) => {
    const { componentName } = values;
    const key = componentName.replace(/[^a-zA-Z-^0-9]/g, "").toLowerCase();

    createComponent(
      { componentName, key },
      {
        async onSuccess(data) {
          setComponentId(data.id);
          await router.push(`${router.pathname}/${data.name.toLowerCase()}`);
        },
      },
    );
  };

  return (
    <div className="components-list">
      <div className="actions">
        <button
          className="button is-tertiary"
          onClick={() => setAddComponentPopupOpen(true)}
        >
          {t("pages:addComponent")}
        </button>
      </div>
      {!components ? (
        <div>Loading...</div>
      ) : (
        <>
          {components?.length ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>{t("common:name")}</th>
                    <th>{t("common:action")}</th>
                  </tr>
                </thead>
                <motion.tbody layout>
                  <AnimatePresence>
                    {components.map((component, index) => {
                      const { name, id } = component;

                      return (
                        <motion.tr
                          layout
                          animate={{ opacity: 1 }}
                          initial={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          key={index}
                        >
                          <th>{name}</th>
                          <td>
                            <div
                              className="edit-button"
                              onClick={() => setComponentId(id)}
                            >
                              <Link
                                href={`${
                                  router.pathname
                                }/${name.toLowerCase()}`}
                                className="button is-primary"
                              >
                                <span>{t("common:edit")}</span>
                              </Link>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>
          ) : (
            <div className="empty-message">
              Currently there are no Components
            </div>
          )}
        </>
      )}
      <div
        className={`popup${
          addComponentPopupOpen ? " is-active" : ""
        } add-component-popup`}
      >
        <div
          className="blur-background"
          onClick={() => setAddComponentPopupOpen(false)}
        />
        <div className="container">
          <h2 className="headline h4">{t("pages:addComponent")}</h2>
          <Formik
            enableReinitialize={true}
            initialValues={{ componentName: "" }}
            onSubmit={submitHandler}
            validationSchema={validationSchema}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="row">
                  <label htmlFor="componentName">
                    {t("admin:componentName")}:
                  </label>
                  <TextField name="componentName" />
                </div>
                <div className="actions">
                  <button
                    className="button is-primary back"
                    type="button"
                    onClick={() => setAddComponentPopupOpen(false)}
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
      </div>
    </div>
  );
};

export default ComponentsList;
