import { getGastos, CATEGORIAS, MESES_PT } from '@/lib/sheets'
import { AlertTriangle, TrendingDown } from 'lucide-react'
import AnnualLineChart from '@/components/AnnualLineChart'
import PdfExportButton from '@/components/PdfExportButton'

export const dynamic = 'force-dynamic'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const fmtShort = (v: number) => {
  if (v === 0) return ''
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

const fmtPdf = (v: number) =>
  v === 0
    ? '-'
    : v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })

function heatColor(v: number, max: number): string {
  if (v === 0 || max === 0) return ''
  const ratio = v / max
  if (ratio > 0.75) return 'bg-rose-500/25 text-rose-300'
  if (ratio > 0.5) return 'bg-orange-500/20 text-orange-300'
  if (ratio > 0.25) return 'bg-amber-500/15 text-amber-300'
  return 'bg-emerald-500/10 text-emerald-400'
}

function SheetsError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <AlertTriangle size={48} className="text-rose-400 opacity-70" />
      <h2 className="text-xl font-semibold text-white">Erro ao carregar dados</h2>
      <p className="text-gray-400 text-sm max-w-md">{message}</p>
      <p className="text-gray-600 text-xs">Verifique as credenciais do Google Sheets nas variáveis de ambiente.</p>
    </div>
  )
}

export default async function ResumoAnualPage() {
  const gastosOrError = await getGastos().catch((err) =>
    err instanceof Error ? err.message : 'Erro desconhecido'
  )
  if (typeof gastosOrError === 'string') return <SheetsError message={gastosOrError} />
  const gastos = gastosOrError
  const ano = new Date().getFullYear()

  const gastosAno = gastos.filter((g) => {
    const parts = g.data.split('/')
    return parts.length >= 3 && parseInt(parts[2]) === ano
  })

  const matrix: Record<string, number[]> = {}
  for (const cat of CATEGORIAS) {
    matrix[cat] = Array(12).fill(0)
  }
  for (const g of gastosAno) {
    const parts = g.data.split('/')
    if (parts.length < 3) continue
    const mesIdx = parseInt(parts[1]) - 1
    if (mesIdx >= 0 && mesIdx < 12 && matrix[g.categoria]) {
      matrix[g.categoria][mesIdx] += g.valor
    }
  }

  const categoriasAtivas = CATEGORIAS.filter((cat) =>
    matrix[cat].some((v) => v > 0)
  )

  const totaisMensais = Array.from({ length: 12 }, (_, i) => ({
    mes: MESES_PT[i],
    total: CATEGORIAS.reduce((s, cat) => s + (matrix[cat]?.[i] ?? 0), 0),
  }))

  const totalGeral = totaisMensais.reduce((s, m) => s + m.total, 0)

  const maxPorCategoria: Record<string, number> = {}
  for (const cat of categoriasAtivas) {
    maxPorCategoria[cat] = Math.max(...matrix[cat])
  }

  // PDF data
  const pdfHeaders = ['Categoria', ...MESES_PT, 'Total']
  const pdfRows = categoriasAtivas.map((cat) => {
    const catTotal = matrix[cat].reduce((s, v) => s + v, 0)
    return [cat, ...matrix[cat].map(fmtPdf), fmt(catTotal)]
  })
  const pdfFooter = [
    'Total',
    ...totaisMensais.map((m) => fmtPdf(m.total)),
    fmt(totalGeral),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Resumo Anual</h1>
          <p className="text-gray-500 text-sm mt-1">
            {ano} · {gastosAno.length} transações · Total {fmt(totalGeral)}
          </p>
        </div>
        {gastosAno.length > 0 && (
          <PdfExportButton
            filename={`resumo-anual-${ano}`}
            title={`Resumo Anual de Gastos — ${ano}`}
            headers={pdfHeaders}
            rows={pdfRows}
            footerRow={pdfFooter}
          />
        )}
      </div>

      {gastosAno.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-24 text-gray-600">
          <TrendingDown size={40} className="mb-3 opacity-40" />
          <p className="text-sm">Nenhum dado para {ano}</p>
        </div>
      ) : (
        <>
          {/* Line chart */}
          <div className="card p-6">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">
              Evolução mensal dos gastos
            </h2>
            <AnnualLineChart data={totaisMensais} />
          </div>

          {/* Table: categories × months */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="text-left px-5 py-3.5 font-medium sticky left-0 bg-gray-900 z-10 min-w-[120px]">
                      Categoria
                    </th>
                    {MESES_PT.map((m) => (
                      <th key={m} className="text-right px-3 py-3.5 font-medium min-w-[80px]">
                        {m}
                      </th>
                    ))}
                    <th className="text-right px-5 py-3.5 font-medium min-w-[110px] sticky right-0 bg-gray-900 z-10">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {categoriasAtivas.map((cat) => {
                    const catTotal = matrix[cat].reduce((s, v) => s + v, 0)
                    return (
                      <tr key={cat} className="hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3 font-semibold text-gray-300 sticky left-0 bg-gray-900 z-10">
                          {cat}
                        </td>
                        {matrix[cat].map((v, i) => {
                          const color = heatColor(v, maxPorCategoria[cat])
                          return (
                            <td key={i} className="px-3 py-3 text-right">
                              {v > 0 ? (
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-lg text-xs font-medium ${color}`}
                                >
                                  {fmtShort(v)}
                                </span>
                              ) : (
                                <span className="text-gray-800">—</span>
                              )}
                            </td>
                          )
                        })}
                        <td className="px-5 py-3 text-right font-bold text-white sticky right-0 bg-gray-900 z-10">
                          {fmt(catTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-700">
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase sticky left-0 bg-gray-900 z-10">
                      Total
                    </td>
                    {totaisMensais.map(({ mes, total }) => (
                      <td
                        key={mes}
                        className="px-3 py-3.5 text-right text-xs text-gray-400 font-semibold"
                      >
                        {fmtShort(total)}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-right text-sm font-bold text-indigo-300 sticky right-0 bg-gray-900 z-10">
                      {fmt(totalGeral)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
