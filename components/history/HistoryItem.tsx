import { FC } from "react";
import { trpc } from "../../src/utils/trpc";
import UserProfile from "../profile/UserProfile";
import { useTranslation } from "next-i18next";

const HistoryItem: FC<{
    id: string;
    updated: Date;
    pageId: string;
}> = ({ id, updated, pageId }) => {
    const { t } = useTranslation("panel");
    const { data: user } = trpc.useQuery(["auth.getUser", { id: id }]);
    const { data: page } = trpc.useQuery(["auth.pages.getPageFromHistory", { pageId }]);

    const lastUpdate = () => {
        const distance = Date.now() - updated.getTime();

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (days > 0) {
            return `${days} ${t("history.daysAgo")}`;
        }
        if (hours > 0) {
            return `${hours} ${t("history.hoursAgo")}`;
        }
        if (minutes > 0) {
            return `${minutes} ${t("history.minutesAgo")}`;
        }
        if (seconds <= 60) {
            return `${seconds} ${t("history.secondsAgo")}`;
        }
    };

    return (
        <div className="user">
            {!user || !page ? (
                <div>Loading....</div>
            ) : (
                <>
                    <UserProfile image={user.image!} name={user.name!} status={user.status} page={page.name} />
                    <div className="updated">{lastUpdate()}</div>
                </>
            )}
        </div>
    );
};

export default HistoryItem;
