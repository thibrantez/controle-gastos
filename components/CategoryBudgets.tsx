'use client'

import { useEffect, useState } from 'react'
import { CATEGORIAS } from '@/lib/constants'

interface Props {
  gastosPorCategoria: Record<string, number>
}

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const STORAGE_KEY = 'category_budgets'

export default function CategoryBudgets({ gastosPorCategoria }: Props) {
  const [budgets, setBudgets] = useState<Record<string, number>>({})
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setBudgets(JSON.parse(stored))
  }, [])

  const saveBudget = (cat: string, raw: string) => {
    const value = parseFloat(raw.replace(',', '.')) || 0
    const next = { ...budgets, [cat]: value }
    setBudgets(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setEditing(null)
  }

  const activeCats = CATEGORIAS.filter(
    (cat) => (gastosPorCategoria[cat] ?? 0) > 0 || (budgets[cat] ?? 0) > 0
  )

  if (activeCats.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400">Metas por Categoria</h2>
        <p className="text-xs text-gray-600">Clique no valor para definir o limite</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeCats.map((cat) => {
          const spent = gastosPorCategoria[cat] ?? 0
          const limit = budgets[cat] ?? 0
          const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
          const over = limit > 0 && spent > limit
          const isEditing = editing === cat

          return (
            <div key={cat} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300 font-medium">{cat}</span>
                {isEditing ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-24 bg-gray-800 border border-gray-700 rounded-lg px-2 py-0.5 text-xs text-white text-right focus:outline-none focus:border-indigo-500"
                      placeholder="0"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveBudget(cat, editValue)
                        if (e.key === 'Escape') setEditing(null)
                      }}
                    />
                    <button
                      onClick={() => saveBudget(cat, editValue)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 px-1"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="text-xs text-gray-600 hover:text-gray-400 px-0.5"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditing(cat)
                      setEditValue(limit > 0 ? String(limit) : '')
                    }}
                    className="text-xs text-gray-500 hover:text-indigo-400 transition-colors"
                  >
                    {limit > 0 ? fmt(limit) : '+ Meta'}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={over ? 'text-rose-400 font-semibold' : 'text-gray-400'}>
                  {fmt(spent)}
                </span>
                {limit > 0 && (
                  <span className={`font-medium ${over ? 'text-rose-400' : 'text-gray-500'}`}>
                    {pct.toFixed(0)}%{over && ' ⚠'}
                  </span>
                )}
              </div>

              {limit > 0 && (
                <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      over
                        ? 'bg-rose-500'
                        : pct > 75
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
