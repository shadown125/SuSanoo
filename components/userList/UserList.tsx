import { FC, useState } from "react";
import { trpc } from "../../src/utils/trpc";
import Filter from "./Filter";
import { useTranslation } from "next-i18next";
import { motion, AnimatePresence } from "framer-motion";
import UserListItem from "./UserListItem";

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

    const emptyMessageOnState = (): string | undefined => {
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
                                                    <UserListItem
                                                        createdAt={user.created_at}
                                                        email={user.email!}
                                                        image={user.image!}
                                                        name={user.name!}
                                                        role={user.role!}
                                                        status={user.status!}
                                                    />
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
