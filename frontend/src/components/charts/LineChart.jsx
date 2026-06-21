import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function LineChart({ labels, datasets, title, height = 200 }) {
  const chartData = {
    labels: labels || [],
    datasets: (datasets || []).map((ds) => ({
      ...ds,
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
      backgroundColor: ds.backgroundColor || 'rgba(168, 85, 247, 0.1)',
      borderColor: ds.borderColor || '#a855f7',
    })),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: datasets?.length > 1,
        position: 'top',
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#fff',
        bodyColor: '#9ca3af',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: '#2a2a2a', drawBorder: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      y: {
        grid: { color: '#2a2a2a', drawBorder: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
    },
  }

  return (
    <div className="card">
      {title && (
        <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      )}
      <div style={{ height }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
