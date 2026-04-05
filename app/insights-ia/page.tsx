'use client'

import { useEffect, useState } from 'react'
import {
  Sparkles,
  Brain,
  TrendingDown,
  AlertTriangle,
  Target,
  RefreshCw,
  TriangleAlert,
} from 'lucide-react'

interface Insights {
  analise_mes: string
  onde_economizar: string[]
  alerta_gastos: string
  meta_mes: string
  gerado_em: string
}

export default function InsightsIAPage() {
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInsights = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/insights')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erro ao buscar insights')
      setInsights(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Insights IA</h1>
          <p className="text-gray-500 text-sm mt-1">
            Análise inteligente dos seus gastos
            {insights?.gerado_em && !loading && (
              <span> · Atualizado {insights.gerado_em}</span>
            )}
          </p>
        </div>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white transition-all"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analisando…' : 'Atualizar Análise'}
        </button>
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="card p-4 bg-rose-500/10 border-rose-500/30 flex items-start gap-3">
          <TriangleAlert size={18} className="text-rose-400 shrink-0 mt-0.5" />
          <p className="text-sm text-rose-300">{error}</p>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-5">
        {/* Análise do Mês — full width */}
        <InsightCard
          icon={<Brain size={20} className="text-blue-400" />}
          iconBg="bg-blue-500/15"
          gradient="from-blue-600/10 to-indigo-600/10"
          border="border-blue-500/20"
          title="Análise do Mês"
          loading={loading}
          skeletonLines={4}
        >
          <p className="text-gray-300 text-sm leading-relaxed">
            {insights?.analise_mes}
          </p>
        </InsightCard>

        {/* Row: Onde Economizar + Alerta */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <InsightCard
            icon={<TrendingDown size={20} className="text-emerald-400" />}
            iconBg="bg-emerald-500/15"
            gradient="from-emerald-600/10 to-teal-600/10"
            border="border-emerald-500/20"
            title="Onde Economizar"
            loading={loading}
            skeletonLines={5}
          >
            <ul className="space-y-3">
              {insights?.onde_economizar.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {i + 1}
                  </span>
                  <p className="text-gray-300 text-sm leading-relaxed">{s}</p>
                </li>
              ))}
            </ul>
          </InsightCard>

          <InsightCard
            icon={<AlertTriangle size={20} className="text-amber-400" />}
            iconBg="bg-amber-500/15"
            gradient="from-amber-600/10 to-orange-600/10"
            border="border-amber-500/20"
            title="Alerta de Gastos"
            loading={loading}
            skeletonLines={3}
          >
            <p className="text-gray-300 text-sm leading-relaxed">
              {insights?.alerta_gastos}
            </p>
          </InsightCard>
        </div>

        {/* Meta do Mês — full width */}
        <InsightCard
          icon={<Target size={20} className="text-purple-400" />}
          iconBg="bg-purple-500/15"
          gradient="from-purple-600/10 to-pink-600/10"
          border="border-purple-500/20"
          title="Meta do Mês"
          loading={loading}
          skeletonLines={3}
        >
          <p className="text-gray-300 text-sm leading-relaxed">
            {insights?.meta_mes}
          </p>
        </InsightCard>
      </div>

      {/* Footer */}
      {!loading && !error && (
        <p className="text-xs text-gray-700 text-center flex items-center justify-center gap-1.5">
          <Sparkles size={11} />
          Gerado por Claude Sonnet 4 (Anthropic) · Sugestões baseadas nos seus dados reais
        </p>
      )}
    </div>
  )
}

function InsightCard({
  icon,
  iconBg,
  gradient,
  border,
  title,
  loading,
  skeletonLines,
  children,
}: {
  icon: React.ReactNode
  iconBg: string
  gradient: string
  border: string
  title: string
  loading: boolean
  skeletonLines: number
  children?: React.ReactNode
}) {
  return (
    <div
      className={`rounded-2xl border p-6 bg-gradient-to-br ${gradient} ${border}`}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}
        >
          {icon}
        </div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>

      {/* Content or skeleton */}
      {loading ? (
        <Skeleton lines={skeletonLines} />
      ) : (
        children
      )}
    </div>
  )
}

function Skeleton({ lines }: { lines: number }) {
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-11/12', 'w-3/4', 'w-2/3']
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3 rounded-full bg-gray-700/60 animate-pulse ${widths[i % widths.length]}`}
        />
      ))}
    </div>
  )
}
