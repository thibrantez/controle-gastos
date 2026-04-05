'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MESES_PT } from '@/lib/constants'

interface Props {
  mes: number
  ano: number
}

export default function MonthSelector({ mes, ano }: Props) {
  const router = useRouter()

  const go = (m: number, a: number) => router.push(`/?mes=${m}&ano=${a}`)

  const prev = () => (mes === 1 ? go(12, ano - 1) : go(mes - 1, ano))
  const next = () => (mes === 12 ? go(1, ano + 1) : go(mes + 1, ano))

  const now = new Date()
  const curMes = now.getMonth() + 1
  const curAno = now.getFullYear()
  const isCurrentMonth = mes === curMes && ano === curAno

  const years = Array.from({ length: 6 }, (_, i) => curAno - 5 + i)

  const selectCls =
    'bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer py-1.5 appearance-none'

  return (
    <div className="flex items-center gap-2">
      {!isCurrentMonth && (
        <button
          onClick={() => go(curMes, curAno)}
          className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 transition-colors whitespace-nowrap"
        >
          Mês atual
        </button>
      )}

      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <button
          onClick={prev}
          className="px-2.5 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="flex items-center gap-1 px-2">
          <select
            value={mes}
            onChange={(e) => go(parseInt(e.target.value), ano)}
            className={selectCls}
          >
            {MESES_PT.map((m, i) => (
              <option key={i} value={i + 1} className="bg-gray-800 text-white">
                {m}
              </option>
            ))}
          </select>

          <select
            value={ano}
            onChange={(e) => go(mes, parseInt(e.target.value))}
            className={selectCls}
          >
            {years.map((y) => (
              <option key={y} value={y} className="bg-gray-800 text-white">
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={next}
          className="px-2.5 py-2 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
