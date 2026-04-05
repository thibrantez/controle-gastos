'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X, Settings2 } from 'lucide-react'

const STORAGE_KEY = 'low_balance_threshold'
const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function ConfigForm({
  value,
  onChange,
  onSave,
  onClose,
}: {
  value: string
  onChange: (v: string) => void
  onSave: () => void
  onClose: () => void
}) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-xs text-gray-500">Limite mínimo:</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
        placeholder="Ex: 500"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave()
          if (e.key === 'Escape') onClose()
        }}
      />
      <button onClick={onSave} className="text-xs text-indigo-400 hover:text-indigo-300">
        Salvar
      </button>
      <button onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300">
        Cancelar
      </button>
    </div>
  )
}

export default function LowBalanceAlert({ saldo }: { saldo: number }) {
  const [threshold, setThreshold] = useState(0)
  const [editValue, setEditValue] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setThreshold(parseFloat(stored) || 0)
  }, [])

  const handleSave = () => {
    const v = parseFloat(editValue.replace(',', '.')) || 0
    setThreshold(v)
    localStorage.setItem(STORAGE_KEY, String(v))
    setShowConfig(false)
    setDismissed(false)
  }

  const isAlert = threshold > 0 && saldo < threshold && !dismissed

  if (isAlert) {
    return (
      <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={18} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-rose-300">Saldo baixo!</p>
          <p className="text-xs text-rose-400/80 mt-0.5">
            Saldo de {fmt(saldo)} está abaixo do limite de {fmt(threshold)}.
          </p>
          {showConfig ? (
            <ConfigForm
              value={editValue}
              onChange={setEditValue}
              onSave={handleSave}
              onClose={() => setShowConfig(false)}
            />
          ) : (
            <button
              onClick={() => {
                setEditValue(String(threshold))
                setShowConfig(true)
              }}
              className="text-xs text-rose-400 hover:text-rose-300 mt-1 underline transition-colors"
            >
              Alterar limite
            </button>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-rose-500 hover:text-rose-300 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  if (showConfig) {
    return (
      <div className="card p-4 flex items-start gap-3">
        <Settings2 size={16} className="text-gray-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs text-gray-400 font-medium">Alerta de saldo baixo</p>
          <ConfigForm
            value={editValue}
            onChange={setEditValue}
            onSave={handleSave}
            onClose={() => setShowConfig(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => {
        setEditValue(String(threshold || ''))
        setShowConfig(true)
      }}
      className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1.5 transition-colors"
    >
      <Settings2 size={12} />
      Alerta de saldo baixo{threshold > 0 ? ` · limite ${fmt(threshold)}` : ' (desativado)'}
    </button>
  )
}
