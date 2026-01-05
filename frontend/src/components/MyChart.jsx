import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register the components you need
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const data = {
  labels: ["January", "February", "March", "April"],
  datasets: [
    {
      label: "Sales",
      data: [12, 19, 3, 5],
      backgroundColor: "rgba(75, 192, 192, 0.5)",
    },
  ],
};

export default function MyChart() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Bar data={data} options={{ responsive: true }} />
    </div>
  );
}
