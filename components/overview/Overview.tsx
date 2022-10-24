import { FC } from "react";
import { useInView } from "react-intersection-observer";
import Charts from "./Charts";
import { useTranslation } from "next-i18next";

const Overview: FC = () => {
    const { ref, inView } = useInView();
    const { t } = useTranslation("");

    return (
        <div className="overview" ref={ref}>
            <div className="online-users">
                <h2 className="headline h4">{t("panel:overview.title")}: 2</h2>
                <div className="bar">
                    <span className={`inner-bar${inView ? " is-active" : ""}`}></span>
                </div>
            </div>
            <Charts />
        </div>
    );
};

export default Overview;
