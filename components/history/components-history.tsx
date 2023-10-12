import { FC } from "react";
import { api } from "@/utils/api";
import History, { history } from "./history";

const ComponentsHistory: FC<{ id: string }> = ({ id }) => {
  const { data: history } =
    api.authComponents.getCurrentComponentsHistory.useQuery({ id: id });

  return <History history={history as history} />;
};

export default ComponentsHistory;
