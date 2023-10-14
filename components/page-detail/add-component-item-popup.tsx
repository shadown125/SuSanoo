import { api } from "@/utils/api";
import { Form, Formik } from "formik";
import { useTranslation } from "next-i18next";
import { object, string } from "yup";
import TextField from "../../elements/input-fields/text-field";
import { useDetailPageStore } from "../../src/store/store";
import { ComponentInputBuilder } from "./component-input";
import { buildValidationSchema } from "./page-detail";

const validationSchema = object({
  itemName: string().required("itemNameRequired"),
});

const AddComponentItemPopup = () => {
  const { t } = useTranslation("admin");
  const { t: tPages } = useTranslation("pages");

  const ctx = api.useContext();

  const { componentId, addComponentItemPopup, setAddComponentItemPopup } =
    useDetailPageStore((state) => ({
      componentId: state.componentId,
      addComponentItemPopup: state.addComponentItemPopup,
      setAddComponentItemPopup: state.setAddComponentItemPopup,
    }));

  const { data: component, isLoading } =
    api.authComponents.getPageComponentById.useQuery({ id: componentId });
  const { mutate: addComponentItem } =
    api.authPages.createPageComponentItem.useMutation();

  const filteredInputs = component?.componentItems.inputs.filter(
    (input) => input.componentItemId,
  );

  const initialValues: Record<string, string> = {};

  const buildInitialValues = () => {
    filteredInputs?.forEach((input) => {
      initialValues[input.id] = "";
    });

    return { itemName: "", ...initialValues };
  };

  const buildInputFieldConfigSchema = () => {
    const inputsFieldConfig: object[] = [];

    filteredInputs?.forEach(({ id, name, type, required }) => {
      inputsFieldConfig.push({
        id: id,
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

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const yepSchema = inputsFieldConfig.reduce(buildValidationSchema, {});

    return object().shape(yepSchema).concat(validationSchema);
  };

  const submitHandler = (
    data: typeof initialValues,
    {
      setSubmitting,
      resetForm,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
      resetForm: (isReset: boolean) => void;
    },
  ) => {
    try {
      addComponentItem(
        {
          componentId: componentId,
          name: data.itemName!,
          pageId: component!.pageId,
          pageComponentData: data,
        },
        {
          async onSuccess() {
            await ctx.authPages.getCurrentPageComponents.invalidate();
            await ctx.authPages.getPageInputsValues.invalidate();
          },
        },
      );

      setAddComponentItemPopup(false);

      setSubmitting(false);
      resetForm(true);
    } catch (err) {
      setSubmitting(false);

      throw new Error(err as string);
    }
  };

  return (
    <div
      className={`popup add-component-item-popup${
        addComponentItemPopup ? " is-active" : ""
      }`}
    >
      <div
        className="blur-background"
        onClick={() => setAddComponentItemPopup(false)}
      />
      <div className="container">
        {isLoading ? (
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
                {filteredInputs?.map(({ id, type, name }) => (
                  <div className="row" key={id}>
                    <label htmlFor={name}>{name}:</label>
                    {ComponentInputBuilder(type as string, name, id, id)}
                  </div>
                ))}
                <div className="actions">
                  <button
                    className="button is-primary back"
                    type="button"
                    onClick={() => setAddComponentItemPopup(false)}
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
        )}
      </div>
    </div>
  );
};

export default AddComponentItemPopup;
