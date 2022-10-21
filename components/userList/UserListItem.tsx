import { CSSProperties, FC } from "react";
import Image from "next/future/image";
import { motion } from "framer-motion";
import { useTranslation } from "next-i18next";

const UserListItem: FC<{
    name: string;
    status: boolean;
    image: string;
    role: string;
    createdAt: string;
    email: string;
}> = ({ name, status, image, role, createdAt, email }) => {
    const { t } = useTranslation("");

    const setProfileStatusColor = (status: boolean) => {
        return { "--color-profile-status": status ? "var(--color-green)" : "var(--color-red)" } as CSSProperties;
    };

    return (
        <>
            <th>
                <div className="user-profile">
                    <div className="image-wrapper" style={setProfileStatusColor(status)}>
                        <Image src={image as string} sizes="100vw" width={100} height={100} alt="Profile image" />
                    </div>
                    <div className="info">
                        <div className="name">{name}</div>
                        <div className="email">{email}</div>
                    </div>
                </div>
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
