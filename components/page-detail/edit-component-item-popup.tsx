import { FC } from "react";
import { api } from "@/utils/api";
import { Form, Formik } from "formik";
import { useTranslation } from "next-i18next";
import { object, string } from "yup";
import TextField from "../../elements/input-fields/text-field";
import { useActivePageLanguageStore } from "../../src/store/pages-store";
import { useDetailPageStore } from "../../src/store/store";
import { ComponentInputBuilder } from "./component-input";
import { buildValidationSchema } from "./page-detail";

const validationSchema = object({
  itemName: string().required("itemNameRequired"),
});

const EditComponentItemPopup: FC<{
  pageId: string;
}> = ({ pageId }) => {
  const { t } = useTranslation("common");
  const { t: tPages } = useTranslation("pages");

  const ctx = api.useContext();

  const {
    componentItemId,
    updateComponentItemPopup,
    setUpdateComponentItemPopup,
  } = useDetailPageStore((state) => ({
    componentItemId: state.componentItemId,
    updateComponentItemPopup: state.updateComponentItemPopup,
    setUpdateComponentItemPopup: state.setUpdateComponentItemPopup,
  }));

  const { data: pageItemComponent } =
    api.authPages.getPageComponentItemById.useQuery({ id: componentItemId });
  const { mutate: deletePageItemComponent } =
    api.authPages.deletePageComponentItem.useMutation();
  const { data: pageInputsValues } = api.authPages.getPageInputsValues.useQuery(
    { pageId },
  );
  const { mutate: updateComponentItem } =
    api.authPages.setNewPageInputValue.useMutation();

  const activePageLanguage = useActivePageLanguageStore(
    (state) => state.activePageLanguage,
  );

  const filteredInputs = pageInputsValues?.filter(
    (input) => input.pageComponentItemsId === pageItemComponent?.id,
  );

  const initialValues: Record<string, string> = {};

  const buildInitialValues = () => {
    pageItemComponent?.inputs?.forEach((filteredInput) => {
      filteredInput.value.forEach((pageInputValues) => {
        pageInputValues.value.forEach((inputValue) => {
          if (inputValue.language === activePageLanguage) {
            initialValues[pageInputValues.pageComponentItemsInputId || ""] =
              inputValue.value;
          }
        });
      });
    });

    return { itemName: pageItemComponent?.name as string, ...initialValues };
  };

  const buildInputFieldConfigSchema = () => {
    const inputsFieldConfig: {}[] = [];

    pageItemComponent?.inputs?.forEach(({ id, name, type, required }) => {
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

    const yepSchema = inputsFieldConfig.reduce(buildValidationSchema, {});

    return object().shape(yepSchema).concat(validationSchema);
  };

  const submitHandler = (
    data: typeof initialValues,
    { setSubmitting, resetForm }: any,
  ) => {
    try {
      for (const [key, value] of Object.entries(data)) {
        if (key !== "" && key !== "itemName") {
          pageInputsValues?.forEach((pageInput) => {
            if (pageInput.pageComponentItemsInputId === key) {
              updateComponentItem(
                {
                  inputId: pageInput.id,
                  value: value,
                  language: activePageLanguage,
                },
                {
                  onSuccess: () => {
                    ctx.authPages.getCurrentPageComponents.invalidate();
                    ctx.authPages.getPageComponentItemById.invalidate();
                  },
                },
              );
            }
          });
        }
      }

      setSubmitting(false);
      resetForm(true);
    } catch (err) {
      setSubmitting(false);

      throw new Error(err as string);
    }
  };

  const deleteComponentItem = () => {
    deletePageItemComponent(
      {
        pageComponentItemId: componentItemId,
      },
      {
        onSuccess: () => {
          ctx.authPages.getCurrentPageComponents.invalidate();
          ctx.authPages.getPageComponentItemById.invalidate();
          ctx.authPages.getPageInputsValues.invalidate();
        },
      },
    );

    setUpdateComponentItemPopup(false);
  };

  buildInitialValues();

  return (
    <div
      className={`popup edit-component-item-popup${
        updateComponentItemPopup ? " is-active" : ""
      }`}
    >
      <div
        className="blur-background"
        onClick={() => setUpdateComponentItemPopup(false)}
      />
      <div className="container">
        {!pageItemComponent || !pageInputsValues ? (
          <div>Loading...</div>
        ) : (
          <Formik
            enableReinitialize={true}
            initialValues={buildInitialValues()}
            onSubmit={submitHandler}
            validationSchema={buildInputFieldConfigSchema()}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="row">
                  <label htmlFor="name">{tPages("itemName")}:</label>
                  <TextField name="itemName" />
                </div>
                {pageItemComponent?.inputs?.map((pageInput) => {
                  return filteredInputs?.map((pageInputValues) => {
                    if (pageInput.id === pageInputValues.inputId) {
                      return (
                        <div className="row" key={pageInput.id}>
                          <label htmlFor={pageInput.name}>
                            {pageInput.name}:
                          </label>
                          {ComponentInputBuilder(
                            pageInput.type as string,
                            pageInput.name,
                            pageInputValues.pageComponentItemsInputId as string,
                            pageInputValues.pageComponentItemsInputId as string,
                          )}
                        </div>
                      );
                    }
                  });
                })}
                <div className="actions">
                  <button
                    className="button is-primary back"
                    type="button"
                    onClick={() => setUpdateComponentItemPopup(false)}
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
                <button
                  className="button is-primary delete"
                  type="button"
                  onClick={deleteComponentItem}
                >
                  <span>{t("delete")}</span>
                </button>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default EditComponentItemPopup;
