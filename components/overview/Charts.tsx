import { FC } from "react";
import DoughnutChart from "./charts/doughnut-chart";
import LineChart from "./charts/line-chart";

const Charts: FC = () => {
  return (
    <div className="charts">
      <DoughnutChart />
      <LineChart />
    </div>
  );
};

export default Charts;
