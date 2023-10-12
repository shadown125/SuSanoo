import { FC } from "react";
import { useTranslation } from "next-i18next";
import HistoryItem from "./history-item";

export type history = {
  id: string;
  changeBy: string;
  userId: string;
  changeAt: Date;
  pageId?: string | null;
  componentId?: string | null;
}[];

const History: FC<{
  history: history | undefined;
}> = ({ history }) => {
  const { t } = useTranslation("common");

  return (
    <div className="history">
      {!history ? (
        <h1 className="headline h5">{t("history")}</h1>
      ) : (
        <>
          <h1 className="headline h5">{t("history")}</h1>
          <ul>
            {history.map((item, index) => (
              <li key={index}>
                <HistoryItem
                  id={item.userId}
                  updated={item.changeAt}
                  pageId={item.pageId}
                  componentId={item.componentId}
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default History;
