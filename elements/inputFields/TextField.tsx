import { useField } from "formik";
import { useTranslation } from "next-i18next";
import { FC } from "react";

const TextField: FC<{
    name: string;
    getValue?: (value: string) => void;
    value?: string;
}> = (props) => {
    const { t } = useTranslation("admin");
    const [field, meta] = useField(props);
    const errorText = meta.error && meta.touched ? meta.error : "";

    if (errorText) {
        return (
            <>
                <div className="input is-invalid">
                    <input
                        type="text"
                        id={props.name}
                        placeholder={t(props.name)}
                        {...field}
                        onChange={(e) => {
                            field.onChange(e);
                            props.getValue && props.getValue(e.target.value);
                        }}
                        value={(props.value && props.value) || field.value}
                    />
                </div>
                <div className="error-message">{t(`${errorText}`)}</div>
            </>
        );
    }

    return (
        <div className="input">
            <input
                type="text"
                id={props.name}
                placeholder={t(props.name)}
                {...field}
                onChange={(e) => {
                    field.onChange(e);
                    props.getValue && props.getValue(e.target.value);
                }}
                value={(props.value && props.value) || field.value}
            />
        </div>
    );
};

export default TextField;
