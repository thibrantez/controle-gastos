'use client'

import { Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface Props {
  mes: number
  ano: number
}

export default function MonthSelector({ mes, ano }: Props) {
  const router = useRouter()

  const go = (m: number, a: number) => router.push(`/?mes=${m}&ano=${a}`)

  const now = new Date()
  const curMes = now.getMonth() + 1
  const curAno = now.getFullYear()
  const isCurrentMonth = mes === curMes && ano === curAno

  const years = Array.from({ length: 6 }, (_, i) => curAno - 5 + i)

  return (
    <div className="flex items-center gap-2">
      {/* Calendar icon + label */}
      <div className="flex items-center gap-1.5 text-gray-500 mr-1">
        <Calendar size={15} />
        <span className="text-xs font-medium hidden sm:block">Período</span>
      </div>

      {/* Mes dropdown */}
      <div className="relative">
        <select
          value={mes}
          onChange={(e) => go(parseInt(e.target.value), ano)}
          className="appearance-none bg-gray-800 border border-gray-700 text-white text-sm font-medium rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500 hover:border-gray-600 transition-colors cursor-pointer"
        >
          {MESES.map((m, i) => (
            <option key={i} value={i + 1} className="bg-gray-800 text-white">
              {m}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {/* Ano dropdown */}
      <div className="relative">
        <select
          value={ano}
          onChange={(e) => go(mes, parseInt(e.target.value))}
          className="appearance-none bg-gray-800 border border-gray-700 text-white text-sm font-medium rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500 hover:border-gray-600 transition-colors cursor-pointer"
        >
          {years.map((y) => (
            <option key={y} value={y} className="bg-gray-800 text-white">
              {y}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      {/* Botão "Mês atual" quando fora do período corrente */}
      {!isCurrentMonth && (
        <button
          onClick={() => go(curMes, curAno)}
          className="text-xs px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-colors whitespace-nowrap"
        >
          Hoje
        </button>
      )}
    </div>
  )
}
