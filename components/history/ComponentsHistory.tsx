import { FC } from "react";
import { trpc } from "../../src/utils/trpc";
import History from "./History";
import { history } from "./History";

const ComponentsHistory: FC<{ id: string }> = ({ id }) => {
    const { data: history } = trpc.useQuery(["auth.components.getCurrentComponentsHistory", { id: id }]);

    return <History history={history as history} />;
};

export default ComponentsHistory;
