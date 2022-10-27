import { FC } from "react";
import LineChart from "./charts/LineChart";
import DoughnutChart from "./charts/DoughnutChart";

const Charts: FC = () => {
    return (
        <div className="charts">
            <DoughnutChart />
            <LineChart />
        </div>
    );
};

export default Charts;
