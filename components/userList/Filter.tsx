import { Dispatch, FC } from "react";
import { FilteredStates, FilterStates } from "./UserList";
import { useTranslation } from "next-i18next";

const Filter: FC<{ setFiltered: Dispatch<any>; states: FilterStates; filtered: FilteredStates }> = ({ setFiltered, states, filtered }) => {
    const { t } = useTranslation("common");

    const setAllUsers = () => {
        setFiltered(states.All);
    };

    const setActiveUsers = () => {
        setFiltered(states.Active);
    };

    const setOfflineUsers = () => {
        setFiltered(states.Offline);
    };

    return (
        <div className="filter">
            <button className={`button is-secondary${filtered === states.All ? " is-active" : ""}`} onClick={setAllUsers}>
                <span>{t("all")}</span>
            </button>
            <button className={`button is-secondary${filtered === states.Active ? " is-active" : ""}`} onClick={setActiveUsers}>
                <span>{t("active")}</span>
            </button>
            <button className={`button is-secondary${filtered === states.Offline ? " is-active" : ""}`} onClick={setOfflineUsers}>
                <span>{t("offline")}</span>
            </button>
        </div>
    );
};

export default Filter;
