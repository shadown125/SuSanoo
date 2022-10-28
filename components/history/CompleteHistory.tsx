import { FC } from "react";
import History from "./History";
import { trpc } from "../../src/utils/trpc";
import { history } from "./History";

const CompleteHistory: FC = () => {
    const { data: history } = trpc.useQuery(["auth.getCompleteHistory"]);

    return <History history={history as history} />;
};

export default CompleteHistory;
