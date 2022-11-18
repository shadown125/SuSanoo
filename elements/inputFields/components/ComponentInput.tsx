import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { InputComponentType } from "../../../components/pageDetail/ComponentInput";
import { trpc } from "../../../src/utils/trpc";

export enum inputType {
    text,
    textarea,
    checkbox,
    date,
    email,
    number,
    radio,
    select,
}

const ComponentInputBuilder: InputComponentType = ({ name, id, type = inputType.text, rawId }) => {
    const { data: selectOptions } = trpc.useQuery(["auth.inputs.getSelectOptions", { id: rawId ? rawId : "" }]);
    const { t } = useTranslation("admin");
    const [field, meta] = useField(id);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <div className="is-invalid">
                {inputType.text === type && <input type="text" placeholder={name} {...field} />}
                {inputType.email === type && <input type="email" placeholder={name} {...field} />}
                {inputType.date === type && <input type="date" {...field} />}
                {inputType.number === type && <input type="number" {...field} />}
                {inputType.radio === type && <input type="radio" {...field} />}
                {inputType.select === type && selectOptions && (
                    <select {...field}>
                        {selectOptions.map((option, index) => (
                            <option key={index} value={option.name}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                )}
                {inputType.textarea === type && <textarea placeholder={name} {...field} />}
                <div className="error-message">{t(`${errorText}`)}</div>
            </div>
        );
    }

    return (
        <>
            {inputType.text === type && <input type="text" placeholder={name} {...field} />}
            {inputType.textarea === type && <textarea placeholder={name} {...field} />}
            {inputType.email === type && <input type="email" placeholder={name} {...field} />}
            {inputType.date === type && <input type="date" {...field} />}
            {inputType.number === type && <input type="number" {...field} />}
            {inputType.radio === type && <input type="radio" {...field} />}
            {inputType.select === type && selectOptions && (
                <select {...field} value={field.value}>
                    {selectOptions.map((option, index) => (
                        <option key={index} value={option.name}>
                            {option.name}
                        </option>
                    ))}
                </select>
            )}
        </>
    );
};

export default ComponentInputBuilder;
