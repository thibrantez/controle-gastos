import { NextResponse } from 'next/server'
import {
  getGastos,
  getSalario,
  gastosMesAtual,
  totalPorCategoria,
} from '@/lib/sheets'

export const dynamic = 'force-dynamic'

const fmt = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export async function GET() {
  try {
    const [gastos, salario] = await Promise.all([getGastos(), getSalario()])
    const mesAtual = gastosMesAtual(gastos)
    const totalMes = mesAtual.reduce((s, g) => s + g.valor, 0)
    const saldo = salario - totalMes
    const catTotals = totalPorCategoria(mesAtual)

    const now = new Date()
    const mesNome = now.toLocaleDateString('pt-BR', { month: 'long' })
    const ano = now.getFullYear()
    const diaAtual = now.getDate()
    const diasNoMes = new Date(ano, now.getMonth() + 1, 0).getDate()
    const pctMesTranscorrido = ((diaAtual / diasNoMes) * 100).toFixed(0)
    const pctSalarioGasto = ((totalMes / salario) * 100).toFixed(1)

    const categoriasList =
      Object.entries(catTotals)
        .sort((a, b) => b[1] - a[1])
        .map(
          ([cat, val]) =>
            `  - ${cat}: ${fmt(val)} (${((val / totalMes) * 100).toFixed(1)}% do total gasto)`
        )
        .join('\n') || '  (sem lançamentos este mês)'

    const recentTransactions =
      mesAtual
        .slice()
        .reverse()
        .slice(0, 15)
        .map(
          (g) =>
            `  - ${g.data}: ${g.descricao} | ${g.categoria} | ${fmt(g.valor)}`
        )
        .join('\n') || '  (sem lançamentos)'

    const gastoRestantePorDia =
      diaAtual < diasNoMes
        ? fmt(saldo / (diasNoMes - diaAtual))
        : fmt(0)

    const prompt = `Você é um assistente financeiro pessoal especializado em finanças pessoais brasileiras. Analise os dados do mês de ${mesNome}/${ano} e gere insights diretos, úteis e personalizados.

CONTEXTO FINANCEIRO:
- Salário mensal: ${fmt(salario)}
- Total gasto até agora: ${fmt(totalMes)} (${pctSalarioGasto}% do salário)
- Saldo restante: ${fmt(saldo)}
- Hoje é o dia ${diaAtual} de ${diasNoMes} (${pctMesTranscorrido}% do mês transcorrido)
- Número de lançamentos: ${mesAtual.length}
- Pode gastar por dia pelo restante do mês: ${gastoRestantePorDia}

GASTOS POR CATEGORIA:
${categoriasList}

ÚLTIMOS LANÇAMENTOS:
${recentTransactions}

Responda APENAS com um JSON válido, sem texto fora do JSON, sem markdown:
{
  "analise_mes": "3-4 frases analisando o mês de forma direta. Cite percentuais reais. Compare com a regra 50/30/20 (necessidades/desejos/poupança). Indique se o ritmo de gastos é sustentável.",
  "onde_economizar": [
    "Sugestão 1 específica com categoria e valor real mencionado",
    "Sugestão 2 específica com categoria e valor real mencionado",
    "Sugestão 3 específica com categoria e valor real mencionado"
  ],
  "alerta_gastos": "1-2 frases destacando a maior anomalia ou risco: categoria desproporcional, ritmo acelerado, lançamento incomum, ou risco de estouro de orçamento.",
  "meta_mes": "2-3 frases sobre progresso vs orçamento: se está dentro do esperado pro dia ${diaAtual}/${diasNoMes}, quanto pode gastar por dia pelo restante do mês, e se vai fechar positivo."
}`

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024 },
      }),
    })

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text()
      throw new Error(`Gemini API error ${geminiRes.status}: ${errBody}`)
    }

    const geminiData = await geminiRes.json()
    const text: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

    // Extract JSON safely
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Resposta da IA não contém JSON válido')

    const insights = JSON.parse(jsonMatch[0])
    insights.gerado_em = now.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

    return NextResponse.json(insights)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro ao gerar insights: ${message}` },
      { status: 500 }
    )
  }
}
