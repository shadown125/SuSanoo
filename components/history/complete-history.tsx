import { type FC } from "react";
import { api } from "@/utils/api";
import History, { type history } from "./history";

const CompleteHistory: FC = () => {
  const { data: history } = api.auth.getCompleteHistory.useQuery();

  return <History history={history as history} />;
};

export default CompleteHistory;
