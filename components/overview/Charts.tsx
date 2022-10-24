import { FC } from "react";
import { Doughnut, Line } from "react-chartjs-2";
import { ArcElement, CategoryScale, Chart as ChartJS, ChartData, ChartOptions, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { useTranslation } from "next-i18next";

const Charts: FC = () => {
    const { t } = useTranslation("");
    ChartJS.register(CategoryScale, ArcElement, LinearScale, PointElement, LineElement, Tooltip, Legend);

    const labels = [t("common:monday"), t("common:tuesday"), t("common:wednesday"), t("common:thursday"), t("common:friday"), t("common:saturday"), t("common:sunday")];
    const usage = [3, 10, 3, 30, 41, 0, 0];
    const onlineUsers = [1, 2, 3, 10, 3, 0, 0];
    const reportData = [50, 100];

    const LineOptions: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        datasets: {
            line: {
                tension: 0.4,
            },
        },
        scales: {
            xAxes: {
                ticks: {
                    color: "white",
                },
                grid: {
                    display: false,
                },
            },
            yAxes: {
                ticks: {
                    font: {
                        size: 16,
                    },
                    color: "white",
                    stepSize: 15,
                },
                grid: {
                    color: "#4f7079",
                    lineWidth: 2,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

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
        labels: [t("panel:overview.contentActivities"), t("panel:overview.onlineUsers")],
        datasets: [
            {
                label: t("panel:overview.contentActivities"),
                data: labels.map((_, index) => reportData[index]) as number[],
                backgroundColor: ["#68e359", "#fe8757"],
            },
        ],
    };

    const lineData: ChartData<"line"> = {
        labels,
        datasets: [
            {
                label: t("panel:overview.contentActivities"),
                data: labels.map((_, index) => usage[index]) as number[],
                borderColor: "#68e359",
            },
            {
                label: t("panel:overview.onlineUsers"),
                data: labels.map((_, index) => onlineUsers[index]) as number[],
                borderColor: "#fe8757",
            },
        ],
    };

    return (
        <div className="charts">
            <div className="doughnut">
                <Doughnut options={DoughnutOptions} data={doughnutData} />
            </div>
            <div className="line">
                <Line options={LineOptions} data={lineData} />
            </div>
        </div>
    );
};

export default Charts;
