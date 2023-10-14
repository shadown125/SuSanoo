import { type FC } from "react";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { useTranslation } from "next-i18next";
import { Doughnut } from "react-chartjs-2";

const DoughnutChart: FC = () => {
  ChartJS.register(CategoryScale, ArcElement, PointElement, Tooltip, Legend);

  const { t } = useTranslation("");

  const reportData = [50, 100];

  const DoughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    elements: {
      arc: {
        borderWidth: 0,
      },
    },
    plugins: {
      legend: {
        position: "left" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
  };

  const doughnutData: ChartData<"doughnut"> = {
    labels: [
      t("panel:overview.contentActivities"),
      t("panel:overview.onlineUsers"),
    ],
    datasets: [
      {
        label: t("panel:overview.contentActivities"),
        data: reportData.map((_, index) => reportData[index]) as number[],
        backgroundColor: ["#68e359", "#fe8757"],
      },
    ],
  };
  return (
    <div className="doughnut">
      <Doughnut options={DoughnutOptions} data={doughnutData} />
    </div>
  );
};

export default DoughnutChart;
