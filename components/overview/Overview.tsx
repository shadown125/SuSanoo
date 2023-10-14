import { type FC } from "react";
import { api } from "@/utils/api";
import { useTranslation } from "next-i18next";
import { useInView } from "react-intersection-observer";
import Charts from "./charts";

const Overview: FC = () => {
  const { ref, inView } = useInView();
  const { t } = useTranslation("");

  const { data: onlineUsersAmount } = api.auth.getOnlineUsersAmount.useQuery();
  const { data: users } = api.auth.getAllUsers.useQuery();

  return (
    <div className="overview" ref={ref}>
      <div className="online-users">
        <h2 className="headline h4">
          {t("panel:overview.title")}: {onlineUsersAmount}
        </h2>
        <div className="bar">
          {users && onlineUsersAmount ? (
            <span
              className={`inner-bar${inView ? " is-active" : ""}`}
              style={{
                width: `${(onlineUsersAmount / users.length) * 100}%`,
              }}
            ></span>
          ) : (
            <span className="inner-bar" style={{ width: "0%" }}></span>
          )}
        </div>
      </div>
      <Charts />
    </div>
  );
};

export default Overview;
