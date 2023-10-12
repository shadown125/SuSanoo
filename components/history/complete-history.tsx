import { FC } from "react";
import { api } from "@/utils/api";
import History, { history } from "./history";

const CompleteHistory: FC = () => {
  const { data: history } = api.auth.getCompleteHistory.useQuery();

  return <History history={history as history} />;
};

export default CompleteHistory;
