import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import { trpc } from "../../../src/utils/trpc";

const ComponentSelectField: InputComponentType = ({ name, id }) => {
    const { data: selectOptions, isLoading } = trpc.useQuery(["auth.inputs.getSelectOptions", { id: id }]);
    const { t } = useTranslation("admin");
    const [field, meta] = useField(name);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (!selectOptions || isLoading) {
        return <div>Loading...</div>;
    }

    if (errorText) {
        return (
            <>
                <select {...field}>
                    {selectOptions.map((option, index) => (
                        <option key={index} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
                <div className="error-message">{t(`${errorText}`)}</div>
            </>
        );
    }

    return (
        <select {...field}>
            {selectOptions.map((option, index) => (
                <option key={index} value={option.name}>
                    {option.name}
                </option>
            ))}
        </select>
    );
};

export default ComponentSelectField;
