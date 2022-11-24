import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import { trpc } from "../../../src/utils/trpc";

const ComponentSelectField: InputComponentType = ({ name, id, rawId }) => {
    const { data: selectOptions, isLoading } = trpc.useQuery(["auth.inputs.getSelectOptions", { id: rawId ? rawId : "" }]);
    const { t } = useTranslation("admin");
    const [field, meta] = useField(id);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (isLoading || !selectOptions) {
        return <div>Loading...</div>;
    }

    if (errorText) {
        return (
            <div className="is-invalid">
                <select {...field} value={field.value || ""} id={name}>
                    {selectOptions.map((option, index) => (
                        <option key={index} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <div className="error-message">{t(`${errorText}`)}</div>
            </div>
        );
    }

    return (
        <div>
            <select {...field} value={field.value || ""} id={name}>
                {selectOptions.map((option, index) => (
                    <option key={index} value={option.name}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ComponentSelectField;
