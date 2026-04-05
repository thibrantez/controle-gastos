'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { Gasto } from '@/lib/constants'

interface Props {
  gastos: Gasto[]
  salario: number
}

interface TooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-gray-400 mb-1">Dia {label}</p>
      <p className={`font-semibold ${v < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
        {v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </p>
    </div>
  )
}

export default function DailySaldoChart({ gastos, salario }: Props) {
  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()
  const hoje = now.getDate()

  const dailySpent: Record<number, number> = {}
  for (const g of gastos) {
    const parts = g.data.split('/')
    if (parts.length < 3) continue
    if (parseInt(parts[1]) === mes && parseInt(parts[2]) === ano) {
      const d = parseInt(parts[0])
      dailySpent[d] = (dailySpent[d] ?? 0) + g.valor
    }
  }

  let cumulative = 0
  const data = Array.from({ length: hoje }, (_, i) => {
    const d = i + 1
    cumulative += dailySpent[d] ?? 0
    return { dia: String(d), saldo: salario - cumulative }
  })

  const fmtY = (v: number) => {
    if (Math.abs(v) >= 1000) return `R$${(v / 1000).toFixed(1)}k`
    return `R$${v}`
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
        <XAxis
          dataKey="dia"
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={fmtY}
          tick={{ fill: '#6b7280', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={55}
        />
        <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="4 2" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="saldo"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
