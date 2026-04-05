'use client'

import { useEffect, useState } from 'react'
import { Bell, ChevronRight, Send, Shield } from 'lucide-react'
import Link from 'next/link'

const TELEGRAM_KEY = 'telegram_weekly_summary'

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  // on=false → círculo esquerda (left:3), fundo cinza
  // on=true  → círculo direita (left:25), fundo indigo
  // Contenção garantida: 25 + 20 = 45px < 48px (largura do botão)
  const circleLeft = on === true ? 25 : 3
  const bgColor    = on === true ? '#6366f1' : '#4b5563'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-checked={on}
      role="switch"
      style={{
        position: 'relative',
        width: 48,
        height: 26,
        borderRadius: 13,
        backgroundColor: bgColor,
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        padding: 0,
        transition: 'background-color 0.25s',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: circleLeft,
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
          transition: 'left 0.25s',
        }}
      />
    </button>
  )
}

export default function ConfiguracoesPage() {
  const [telegramEnabled, setTelegramEnabled] = useState(false)
  const [chatId, setChatId] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(TELEGRAM_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // não restaura enabled — sempre inicia como false
      setChatId(parsed.chatId ?? '')
    }
  }, [])

  const save = () => {
    localStorage.setItem(TELEGRAM_KEY, JSON.stringify({ enabled: telegramEnabled, chatId }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Configurações</h1>
        <p className="text-gray-500 text-sm mt-1">Preferências e integrações do app</p>
      </div>

      {/* Telegram */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
            <Send size={18} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Resumo Semanal via Telegram</h2>
            <p className="text-xs text-gray-500">
              Receba um resumo todo domingo no Telegram
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-300">Ativar resumo semanal</p>
            <p className="text-xs text-gray-600 mt-0.5">Envia todo domingo às 20h</p>
          </div>
          <Toggle on={telegramEnabled} onToggle={() => setTelegramEnabled((v) => !v)} />
        </div>

        {telegramEnabled && (
          <div className="space-y-3 border-t border-gray-800 pt-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">
                Seu Chat ID do Telegram
              </label>
              <input
                type="text"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Ex: 123456789"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div className="bg-gray-800/50 rounded-xl p-3 space-y-1.5 text-xs text-gray-400">
              <p className="font-medium text-gray-300">Como obter seu Chat ID:</p>
              <p>
                1. Abra o Telegram e busque por{' '}
                <span className="text-indigo-400 font-mono">@userinfobot</span>
              </p>
              <p>2. Envie qualquer mensagem para o bot</p>
              <p>3. O bot responderá com seu Chat ID</p>
              <p className="text-gray-600 pt-1 border-t border-gray-700 mt-2">
                A integração de envio automático via Make será configurada em breve.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={save}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-300'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {saved ? '✓ Salvo!' : 'Salvar configurações'}
        </button>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 mb-3">Configurar no dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href="/" className="card card-hover p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Bell size={18} className="text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300 font-medium">Alerta de Saldo Baixo</p>
              <p className="text-xs text-gray-600 mt-0.5">Define limite mínimo de saldo</p>
            </div>
            <ChevronRight size={16} className="text-gray-600" />
          </Link>
          <Link href="/" className="card card-hover p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Shield size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-300 font-medium">Metas por Categoria</p>
              <p className="text-xs text-gray-600 mt-0.5">Define teto de gasto por categoria</p>
            </div>
            <ChevronRight size={16} className="text-gray-600" />
          </Link>
        </div>
      </div>
    </div>
  )
}
