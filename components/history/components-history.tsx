import { type FC } from "react";
import { api } from "@/utils/api";
import History, { type history } from "./history";

const ComponentsHistory: FC<{ id: string }> = ({ id }) => {
  const { data: history } =
    api.authComponents.getCurrentComponentsHistory.useQuery({ id: id });

  return <History history={history as history} />;
};

export default ComponentsHistory;
