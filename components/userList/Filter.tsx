import { Dispatch, FC } from "react";
import { useTranslation } from "next-i18next";
import { FilteredStates, FilterStates } from "./user-list";

const Filter: FC<{
  setFiltered: Dispatch<any>;
  states: FilterStates;
  filtered: FilteredStates;
}> = ({ setFiltered, states, filtered }) => {
  const { t } = useTranslation("common");

  const setAllUsers = (): void => {
    setFiltered(states.All);
  };

  const setActiveUsers = (): void => {
    setFiltered(states.Active);
  };

  const setOfflineUsers = (): void => {
    setFiltered(states.Offline);
  };

  return (
    <div className="filter">
      <button
        className={`button is-secondary${
          filtered === states.All ? " is-active" : ""
        }`}
        onClick={setAllUsers}
      >
        <span>{t("all")}</span>
      </button>
      <button
        className={`button is-secondary${
          filtered === states.Active ? " is-active" : ""
        }`}
        onClick={setActiveUsers}
      >
        <span>{t("active")}</span>
      </button>
      <button
        className={`button is-secondary${
          filtered === states.Offline ? " is-active" : ""
        }`}
        onClick={setOfflineUsers}
      >
        <span>{t("offline")}</span>
      </button>
    </div>
  );
};

export default Filter;
