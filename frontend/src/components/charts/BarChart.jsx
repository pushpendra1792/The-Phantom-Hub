import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function BarChart({ labels, datasets, title, height = 200 }) {
  const chartData = {
    labels: labels || [],
    datasets: (datasets || []).map((ds) => ({
      ...ds,
      borderRadius: 4,
      borderSkipped: false,
      backgroundColor: ds.backgroundColor || 'rgba(168, 85, 247, 0.8)',
      hoverBackgroundColor: ds.backgroundColor || '#a855f7',
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
        grid: { display: false },
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
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
