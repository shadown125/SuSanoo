import { CSSProperties, FC, useState } from "react";
import { trpc } from "../../src/utils/trpc";
import Image from "next/future/image";
import Filter from "./Filter";
import { useTranslation } from "next-i18next";
import { motion, AnimatePresence } from "framer-motion";

export enum FilteredStates {
    All,
    Active,
    Offline,
}

export type FilterStates = typeof FilteredStates;

const UserList: FC = () => {
    const { t } = useTranslation("");
    const [filtered, setFiltered] = useState<FilteredStates>(FilteredStates.All);
    const { data: users, isLoading } = trpc.useQuery(["auth.getAllUsers"], {
        refetchInterval: 1000 * 60 * 5,
        select: (users) => {
            if (filtered === FilteredStates.All) {
                return users;
            }
            if (filtered === FilteredStates.Active) {
                return users.filter((user) => user.status === true);
            }
            if (filtered === FilteredStates.Offline) {
                return users.filter((user) => user.status === false);
            }
            return users;
        },
    });

    const emptyMessageOnState = () => {
        if (filtered === FilteredStates.All) {
            return t("panel:noRegisteredUsers");
        }
        if (filtered === FilteredStates.Active) {
            return t("panel:noActiveUsers");
        }
        if (filtered === FilteredStates.Offline) {
            return t("panel:noOfflineUsers");
        }
    };

    const setProfileStatusColor = (status: boolean) => {
        return { "--color-profile-status": status ? "var(--color-green)" : "var(--color-red)" } as CSSProperties;
    };

    return (
        <section className="users">
            <div className="container">
                <div className="head">
                    <div className="key-headline">
                        <h3 className="headline h5">{t("panel:userList")}</h3>
                        <span className="sub-headline">{t("panel:registeredUserList")}</span>
                    </div>
                    <Filter setFiltered={setFiltered} states={FilteredStates} filtered={filtered} />
                </div>
                {isLoading && !users ? (
                    <p>Loading...</p>
                ) : (
                    <div className="content">
                        {users!.length ? (
                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>{t("common:profile")}</th>
                                            <th>{t("common:role")}</th>
                                            <th>{t("common:created")}</th>
                                            <th>{t("common:action")}</th>
                                        </tr>
                                    </thead>
                                    <motion.tbody layout>
                                        <AnimatePresence>
                                            {users!.map((user, index) => (
                                                <motion.tr layout animate={{ opacity: 1 }} initial={{ opacity: 0 }} exit={{ opacity: 0 }} key={index}>
                                                    <th>
                                                        <div className="user-profile">
                                                            <div className="image-wrapper" style={setProfileStatusColor(user.status)}>
                                                                <Image src={user.image as string} sizes="100vw" width={100} height={100} alt="Profile image" />
                                                            </div>
                                                            <div className="info">
                                                                <div className="name">{user.name}</div>
                                                                <div className="email">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <td>{user.role}</td>
                                                    <td>{user.created_at}</td>
                                                    <td>
                                                        <button className="button is-primary">
                                                            <span>{t("common:edit")}</span>
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </motion.tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="empty-message">
                                {t("panel:currently")} {emptyMessageOnState()}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default UserList;
