import { FC } from "react";
import { useTranslation } from "next-i18next";
import UserProfile from "../profile/UserProfile";

const UserListItem: FC<{
    name: string;
    status: boolean;
    image: string;
    role: string;
    createdAt: string;
    email: string;
}> = ({ name, status, image, role, createdAt, email }) => {
    const { t } = useTranslation("");

    return (
        <>
            <th>
                <UserProfile image={image} name={name} status={status} email={email} />
            </th>
            <td>{role}</td>
            <td>{createdAt}</td>
            <td>
                <button className="button is-primary">
                    <span>{t("common:edit")}</span>
                </button>
            </td>
        </>
    );
};

export default UserListItem;
