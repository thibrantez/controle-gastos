'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { CATEGORIAS, FORMAS_PAGAMENTO, type Gasto } from '@/lib/constants'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    Alimentos: '🍔', Mercado: '🛒', Lazer: '🎉', Namorada: '💕',
    Jogos: '🎮', Trabalho: '💼', Investimento: '📈', Transporte: '🚌',
    Saúde: '💊', Outros: '📦',
  }
  return map[cat] ?? '💸'
}

export default function HistoricoPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoria, setCategoria] = useState('')
  const [forma, setForma] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetch('/api/gastos')
      .then((r) => r.json())
      .then((data) => setGastos(data))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return gastos
      .slice()
      .reverse()
      .filter((g) => {
        const matchSearch =
          !search ||
          g.descricao.toLowerCase().includes(search.toLowerCase()) ||
          g.categoria.toLowerCase().includes(search.toLowerCase())
        const matchCat = !categoria || g.categoria === categoria
        const matchForma = !forma || g.formaPagamento === forma
        return matchSearch && matchCat && matchForma
      })
  }, [gastos, search, categoria, forma])

  const totalFiltrado = filtered.reduce((s, g) => s + g.valor, 0)
  const hasFilters = search || categoria || forma

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Histórico</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} lançamento{filtered.length !== 1 ? 's' : ''} ·{' '}
            {fmt(totalFiltrado)}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            showFilters || hasFilters
              ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
              : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600'
          }`}
        >
          <SlidersHorizontal size={15} />
          Filtros
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
          )}
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Buscar por descrição ou categoria…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Todas</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">
                Forma de Pagamento
              </label>
              <select
                value={forma}
                onChange={(e) => setForma(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Todas</option>
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {hasFilters && (
          <button
            onClick={() => {
              setSearch('')
              setCategoria('')
              setForma('')
            }}
            className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-sm">Nenhum lançamento encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-medium">Data</th>
                  <th className="text-left px-5 py-3.5 font-medium">Descrição</th>
                  <th className="text-left px-5 py-3.5 font-medium">Categoria</th>
                  <th className="text-left px-5 py-3.5 font-medium">Pagamento</th>
                  <th className="text-right px-5 py-3.5 font-medium">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filtered.map((g, i) => (
                  <tr
                    key={i}
                    className="hover:bg-gray-800/40 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                      {g.data}
                    </td>
                    <td className="px-5 py-3.5 text-white font-medium">
                      {g.descricao}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-800 text-gray-300 text-xs">
                        {categoryEmoji(g.categoria)} {g.categoria}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <PaymentBadge forma={g.formaPagamento} />
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-rose-400 whitespace-nowrap">
                      {fmt(g.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function PaymentBadge({ forma }: { forma: string }) {
  const map: Record<string, string> = {
    'Cartão de Crédito': 'bg-purple-500/15 text-purple-300',
    Débito: 'bg-blue-500/15 text-blue-300',
    'Vale Refeição': 'bg-emerald-500/15 text-emerald-300',
    Pix: 'bg-teal-500/15 text-teal-300',
    Dinheiro: 'bg-amber-500/15 text-amber-300',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
        map[forma] ?? 'bg-gray-800 text-gray-400'
      }`}
    >
      {forma}
    </span>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-5 py-4 border-b border-gray-800/50 animate-pulse"
        >
          <div className="h-4 w-20 bg-gray-800 rounded" />
          <div className="h-4 flex-1 bg-gray-800 rounded" />
          <div className="h-4 w-24 bg-gray-800 rounded" />
          <div className="h-4 w-28 bg-gray-800 rounded" />
          <div className="h-4 w-20 bg-gray-800 rounded ml-auto" />
        </div>
      ))}
    </div>
  )
}
