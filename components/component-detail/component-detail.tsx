import { FC, useState } from "react";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { Input } from "@prisma/client";
import { useTranslation } from "next-i18next";
import { useComponentsStore } from "../../src/store/components-store";
import { usePopupStore } from "../../src/store/store";
import AddInput from "../add-input";
import EditPopup from "./edit-popup";

const ComponentDetail: FC<{
  componentKey: string;
  name: string;
  inputs: Input[];
}> = ({ name, inputs, componentKey }) => {
  const { t } = useTranslation("common");
  const { t: tAdmin } = useTranslation("admin");
  const router = useRouter();

  const { mutate: deleteComponent } = api.authComponents.delete.useMutation();

  const setAddInputPopupState = usePopupStore(
    (state) => state.setAddInputPopupState,
  );
  const { setEditInputId, setIsEditPopupOpen, componentId, setIsItemInput } =
    useComponentsStore((state) => ({
      componentId: state.componentId,
      setIsEditPopupOpen: state.setIsEditPopupOpen,
      setEditInputId: state.setEditInputId,
      setIsItemInput: state.setIsItemInput,
    }));

  const [removeComponentPopupOpen, setRemoveComponentPopupOpen] =
    useState<boolean>(false);

  const handleDeleteComponent = () => {
    deleteComponent(
      { id: componentId },
      {
        onSuccess: () => {
          router.push("/admin/components");
        },
      },
    );
  };

  return (
    <div className="components-detail">
      <div className="head">
        <div className="head-upper">
          <h2 className="headline h4">{name}</h2>
          <button
            className="button is-primary"
            onClick={() => setRemoveComponentPopupOpen(true)}
          >
            <span>{tAdmin("removeComponent")}</span>
          </button>
        </div>
        <h3 className="headline h5 component-key">
          <span>{t("componentKey")}:</span> {componentKey}
        </h3>
      </div>
      <div className="container">
        <div className="component-inputs is-preview">
          {inputs
            .filter((input) => !input.componentItemId)
            .map((input, index) => (
              <div
                key={index}
                className={`row${input.halfRow ? " row-half" : ""}`}
              >
                <label htmlFor={input.name}>
                  {input.name}
                  {input.required ? "*" : ""}
                </label>
                <div>
                  <div className={`input ${input.type}`} />
                </div>
                <button
                  className="button is-primary edit"
                  onClick={() => {
                    setEditInputId(input.id);
                    setIsEditPopupOpen(true);
                  }}
                >
                  <span>Edit input</span>
                </button>
              </div>
            ))}
        </div>
        <div className="component-items is-preview">
          <span className="headline h6">{t("componentItem")}</span>
          {inputs
            .filter((input) => input.componentItemId)
            .map((input, index) => (
              <div
                key={index}
                className={`row${input.halfRow ? " row-half" : ""}`}
              >
                <label htmlFor={input.name}>
                  {input.name}
                  {input.required ? "*" : ""}
                </label>
                <div>
                  <div className={`input ${input.type}`} />
                </div>
                <button
                  className="button is-primary edit"
                  onClick={() => {
                    setEditInputId(input.id);
                    setIsEditPopupOpen(true);
                  }}
                >
                  <span>Edit input</span>
                </button>
              </div>
            ))}
          <button
            className="button is-tertiary add-input"
            onClick={() => {
              setIsItemInput(true);
              setAddInputPopupState(true);
            }}
          >
            <span>{t("addComponentItemInput")}</span>
          </button>
        </div>
        <button
          className="button is-tertiary add-input"
          onClick={() => setAddInputPopupState(true)}
        >
          <span>{t("addComponentInput")}</span>
        </button>
      </div>
      <div className="actions">
        <button
          className="button is-primary back"
          type="button"
          onClick={() => router.push("/admin/components")}
        >
          <span>{t("back")}</span>
        </button>
      </div>
      <div
        className={`popup${
          removeComponentPopupOpen ? " is-active" : ""
        } remove-component-popup`}
      >
        <div
          className="blur-background"
          onClick={() => {
            setIsItemInput(false);
            setRemoveComponentPopupOpen(false);
          }}
        />
        <div className="container">
          <h2 className="headline h4">{tAdmin("removeComponent")}</h2>
          <p>{tAdmin("removeComponentText")}</p>
          <div className="actions">
            <button
              className="button is-primary back"
              type="button"
              onClick={() => {
                setIsItemInput(false);
                setRemoveComponentPopupOpen(false);
              }}
            >
              <span>{t("back")}</span>
            </button>
            <button
              className="button is-primary remove"
              type="button"
              onClick={handleDeleteComponent}
            >
              <span>{t("remove")}</span>
            </button>
          </div>
        </div>
      </div>
      <AddInput />
      <EditPopup />
    </div>
  );
};

export default ComponentDetail;
