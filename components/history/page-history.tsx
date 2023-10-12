import { FC } from "react";
import { api } from "@/utils/api";
import History, { history } from "./history";

const PageHistory: FC<{ id: string }> = ({ id }) => {
  const { data: history } = api.authPages.getCurrentPageHistory.useQuery({
    id: id,
  });

  return <History history={history as history} />;
};

export default PageHistory;
