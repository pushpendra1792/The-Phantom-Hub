import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function DoughnutChart({ data, title, size = 200 }) {
  const total = data?.values?.reduce((a, b) => a + b, 0) || 0

  const chartData = {
    labels: data?.labels || [],
    datasets: [
      {
        data: data?.values || [],
        backgroundColor: data?.colors || ['#a855f7', '#7c3aed', '#c084fc', '#6b7280', '#22c55e', '#f59e0b'],
        borderColor: '#111111',
        borderWidth: 2,
        hoverBorderColor: '#2a2a2a',
      },
    ],
  }

  const options = {
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#9ca3af',
          padding: 16,
          usePointStyle: true,
          pointStyle: 'circle',
          font: { size: 12 },
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
  }

  return (
    <div className="card">
      {title && (
        <h3 className="text-base font-semibold text-white mb-4">{title}</h3>
      )}
      <div className="relative" style={{ width: size, height: size, margin: '0 auto' }}>
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{total}</p>
            <p className="text-xs text-phantom-gray">Total</p>
          </div>
        </div>
      </div>
    </div>
  )
}
