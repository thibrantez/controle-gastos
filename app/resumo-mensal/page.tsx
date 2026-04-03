import { getGastos, resumoMensal, CATEGORIAS, mesLabel } from '@/lib/sheets'
import { TrendingDown } from 'lucide-react'

export const revalidate = 60

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtShort = (v: number) => {
  if (v === 0) return ''
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function heatColor(v: number, max: number): string {
  if (v === 0 || max === 0) return ''
  const ratio = v / max
  if (ratio > 0.75) return 'bg-rose-500/25 text-rose-300'
  if (ratio > 0.5) return 'bg-orange-500/20 text-orange-300'
  if (ratio > 0.25) return 'bg-amber-500/15 text-amber-300'
  return 'bg-emerald-500/10 text-emerald-400'
}

export default async function ResumoMensalPage() {
  const gastos = await getGastos()
  const resumo = resumoMensal(gastos)

  // Filtrar categorias que têm pelo menos algum valor no período
  const categoriasAtivas = CATEGORIAS.filter((cat) =>
    resumo.some((r) => (r.categorias[cat] ?? 0) > 0)
  )

  // Máximo por categoria para heatmap
  const maxPorCategoria: Record<string, number> = {}
  for (const cat of categoriasAtivas) {
    maxPorCategoria[cat] = Math.max(
      ...resumo.map((r) => r.categorias[cat] ?? 0)
    )
  }

  // Total geral
  const totalGeral = resumo.reduce((s, r) => s + r.total, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Resumo Mensal</h1>
          <p className="text-gray-500 text-sm mt-1">
            {resumo.length} meses registrados · Total {fmt(totalGeral)}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500/30 inline-block" /> Baixo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500/30 inline-block" /> Médio
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-rose-500/30 inline-block" /> Alto
          </span>
        </div>
      </div>

      {resumo.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-gray-600">
          <TrendingDown size={40} className="mb-3 opacity-40" />
          <p className="text-sm">Nenhum dado disponível</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left px-5 py-3.5 font-medium sticky left-0 bg-gray-900 z-10 min-w-[110px]">
                    Mês
                  </th>
                  {categoriasAtivas.map((cat) => (
                    <th
                      key={cat}
                      className="text-right px-4 py-3.5 font-medium min-w-[110px]"
                    >
                      {cat}
                    </th>
                  ))}
                  <th className="text-right px-5 py-3.5 font-medium min-w-[110px] sticky right-0 bg-gray-900 z-10">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {resumo.map((r) => (
                  <tr key={r.mes} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-gray-300 sticky left-0 bg-gray-900 z-10">
                      {mesLabel(r.mes)}
                    </td>
                    {categoriasAtivas.map((cat) => {
                      const v = r.categorias[cat] ?? 0
                      const color = heatColor(v, maxPorCategoria[cat])
                      return (
                        <td key={cat} className="px-4 py-3.5 text-right">
                          {v > 0 ? (
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium ${color}`}
                            >
                              {fmtShort(v)}
                            </span>
                          ) : (
                            <span className="text-gray-800">—</span>
                          )}
                        </td>
                      )
                    })}
                    <td className="px-5 py-3.5 text-right font-bold text-white sticky right-0 bg-gray-900 z-10">
                      {fmt(r.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-700">
                  <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase sticky left-0 bg-gray-900 z-10">
                    Total
                  </td>
                  {categoriasAtivas.map((cat) => {
                    const total = resumo.reduce(
                      (s, r) => s + (r.categorias[cat] ?? 0),
                      0
                    )
                    return (
                      <td
                        key={cat}
                        className="px-4 py-3.5 text-right text-xs text-gray-400 font-semibold"
                      >
                        {fmtShort(total)}
                      </td>
                    )
                  })}
                  <td className="px-5 py-3.5 text-right text-sm font-bold text-indigo-300 sticky right-0 bg-gray-900 z-10">
                    {fmt(totalGeral)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Category summary cards */}
      {categoriasAtivas.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 mb-3">
            Acumulado por categoria
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoriasAtivas
              .map((cat) => ({
                cat,
                total: resumo.reduce(
                  (s, r) => s + (r.categorias[cat] ?? 0),
                  0
                ),
              }))
              .sort((a, b) => b.total - a.total)
              .map(({ cat, total }) => (
                <div key={cat} className="card p-4">
                  <p className="text-xs text-gray-500 truncate">{cat}</p>
                  <p className="text-base font-bold text-white mt-1">
                    {fmt(total)}
                  </p>
                  <div className="mt-2 h-1 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (total / totalGeral) * 100 * 3
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
