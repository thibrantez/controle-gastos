'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface Props {
  data: { name: string; value: number }[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#a78bfa', '#60a5fa']

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const total = payload[0].payload.value
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-sm text-gray-300 font-medium mb-1">
        {payload[0].name}
      </p>
      <p className="text-lg font-bold text-white">{fmt(total)}</p>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
      {payload.map((entry: { color: string; value: string }, i: number) => (
        <li key={i} className="flex items-center gap-1.5 text-xs text-gray-400">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  )
}

export default function PaymentPieChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  )
}
