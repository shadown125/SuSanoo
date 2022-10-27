import { FC } from "react";
import { useInView } from "react-intersection-observer";
import Charts from "./Charts";
import { useTranslation } from "next-i18next";
import { trpc } from "../../src/utils/trpc";

const Overview: FC = () => {
    const { ref, inView } = useInView();
    const { t } = useTranslation("");

    const { data: onlineUsersAmount } = trpc.useQuery(["auth.getOnlineUsersAmount"]);
    const { data: users } = trpc.useQuery(["auth.getAllUsers"]);

    return (
        <div className="overview" ref={ref}>
            <div className="online-users">
                <h2 className="headline h4">
                    {t("panel:overview.title")}: {onlineUsersAmount}
                </h2>
                <div className="bar">
                    {users || onlineUsersAmount ? (
                        <span className={`inner-bar${inView ? " is-active" : ""}`} style={{ width: `${(onlineUsersAmount! / users!.length) * 100}%` }}></span>
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
