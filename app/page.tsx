import {
  TrendingDown,
  Wallet,
  AlertTriangle,
  Receipt,
} from 'lucide-react'
import KPICard from '@/components/KPICard'
import CategoryBarChart from '@/components/CategoryBarChart'
import PaymentPieChart from '@/components/PaymentPieChart'
import CategoryBudgets from '@/components/CategoryBudgets'
import DailySaldoChart from '@/components/DailySaldoChart'
import LowBalanceAlert from '@/components/LowBalanceAlert'
import MonthSelector from '@/components/MonthSelector'
import {
  getGastos,
  getSalario,
  totalPorCategoria,
  totalPorFormaPagamento,
} from '@/lib/sheets'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export const dynamic = 'force-dynamic'

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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { mes?: string; ano?: string }
}) {
  const now = new Date()
  const mesSel = parseInt(searchParams.mes ?? '') || now.getMonth() + 1
  const anoSel = parseInt(searchParams.ano ?? '') || now.getFullYear()

  const result = await Promise.all([getGastos(), getSalario()]).catch((err) => {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido'
    return msg as string
  })
  if (typeof result === 'string') return <SheetsError message={result} />
  const [gastos, salario] = result

  const gastosMes = gastos.filter((g) => {
    const parts = g.data.split('/')
    return (
      parts.length >= 3 &&
      parseInt(parts[1]) === mesSel &&
      parseInt(parts[2]) === anoSel
    )
  })

  const totalMes = gastosMes.reduce((s, g) => s + g.valor, 0)
  const saldo = salario - totalMes
  const maiorGasto = gastosMes.reduce(
    (max, g) => (g.valor > max.valor ? g : max),
    gastosMes[0] ?? { valor: 0, descricao: '-' }
  )

  const catData = Object.entries(totalPorCategoria(gastosMes))
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)

  const catTotals = totalPorCategoria(gastosMes)

  const pgData = Object.entries(totalPorFormaPagamento(gastosMes)).map(
    ([name, value]) => ({ name, value })
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold gradient-text">Dashboard</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <MonthSelector mes={mesSel} ano={anoSel} />
          <LowBalanceAlert saldo={saldo} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Gasto (mês)"
          value={fmt(totalMes)}
          subtitle={`de ${fmt(salario)} de salário`}
          icon={TrendingDown}
          iconColor="text-rose-400"
          gradient="from-rose-500/10 to-pink-500/10"
        />
        <KPICard
          title="Saldo Restante"
          value={fmt(Math.abs(saldo))}
          subtitle={saldo < 0 ? 'Orçamento estourado' : 'Disponível no mês'}
          icon={Wallet}
          iconColor={saldo >= 0 ? 'text-emerald-400' : 'text-rose-400'}
          gradient={
            saldo >= 0
              ? 'from-emerald-500/10 to-teal-500/10'
              : 'from-rose-500/10 to-red-500/10'
          }
        />
        <KPICard
          title="Maior Gasto"
          value={fmt(maiorGasto?.valor ?? 0)}
          subtitle={maiorGasto?.descricao ?? '-'}
          icon={AlertTriangle}
          iconColor="text-amber-400"
          gradient="from-amber-500/10 to-orange-500/10"
        />
        <KPICard
          title="Lançamentos"
          value={String(gastosMes.length)}
          subtitle="transações no mês"
          icon={Receipt}
          iconColor="text-blue-400"
          gradient="from-blue-500/10 to-indigo-500/10"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-base font-semibold text-white mb-1">Gastos por Categoria</h2>
          <p className="text-xs text-gray-500 mb-6">Período selecionado</p>
          {catData.length > 0 ? <CategoryBarChart data={catData} /> : <EmptyState />}
        </div>

        <div className="card p-6">
          <h2 className="text-base font-semibold text-white mb-1">Forma de Pagamento</h2>
          <p className="text-xs text-gray-500 mb-6">Período selecionado</p>
          {pgData.length > 0 ? <PaymentPieChart data={pgData} /> : <EmptyState />}
        </div>
      </div>

      {/* Daily balance chart */}
      {gastosMes.length > 0 && (
        <div className="card p-6">
          <h2 className="text-base font-semibold text-white mb-1">Evolução do Saldo</h2>
          <p className="text-xs text-gray-500 mb-4">Saldo dia a dia no período selecionado</p>
          <DailySaldoChart gastos={gastosMes} salario={salario} mes={mesSel} ano={anoSel} />
        </div>
      )}

      {/* Category budgets */}
      <CategoryBudgets gastosPorCategoria={catTotals} />

      {/* Recent transactions */}
      <div className="card p-6">
        <h2 className="text-base font-semibold text-white mb-4">Últimos Lançamentos</h2>
        {gastosMes.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {gastosMes
              .slice()
              .reverse()
              .slice(0, 8)
              .map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-800/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-lg">
                      {categoryEmoji(g.categoria)}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{g.descricao}</p>
                      <p className="text-xs text-gray-500">
                        {g.data} · {g.categoria}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-rose-400">-{fmt(g.valor)}</p>
                    <p className="text-xs text-gray-600">{g.formaPagamento}</p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-gray-600">
      <Receipt size={32} className="mb-2 opacity-40" />
      <p className="text-sm">Nenhum lançamento neste período</p>
    </div>
  )
}

function categoryEmoji(cat: string) {
  const map: Record<string, string> = {
    Alimentos: '🍔', Mercado: '🛒', Lazer: '🎉', Namorada: '💕',
    Jogos: '🎮', Trabalho: '💼', Investimento: '📈', Transporte: '🚌',
    Saúde: '💊', Outros: '📦',
  }
  return map[cat] ?? '💸'
}
