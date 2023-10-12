import { FC, useState } from "react";
import { api } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "next-i18next";
import Filter from "./filter";
import UserListItem from "./user-list-item";

export enum FilteredStates {
  All,
  Active,
  Offline,
}

export type FilterStates = typeof FilteredStates;

const UserList: FC = () => {
  const { t } = useTranslation("");
  const [filtered, setFiltered] = useState<FilteredStates>(FilteredStates.All);
  const { data: users, isLoading } = api.auth.getUsers.useQuery(undefined, {
    refetchInterval: 1000 * 60 * 5,
    select: (users) => {
      if (filtered === FilteredStates.All) {
        return users.sort((a, b) =>
          a.status === b.status ? 0 : a.status ? -1 : 1,
        );
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
            <span className="sub-headline">
              {t("panel:registeredUserList")}
            </span>
          </div>
          <Filter
            setFiltered={setFiltered}
            states={FilteredStates}
            filtered={filtered}
          />
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
                        <motion.tr
                          layout
                          animate={{ opacity: 1 }}
                          initial={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          key={user.id}
                        >
                          <UserListItem
                            createdAt={user.createdAt.toLocaleDateString()}
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
