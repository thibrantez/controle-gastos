import { NextResponse } from 'next/server'
import { getGastos, appendGasto } from '@/lib/sheets'

export async function GET() {
  try {
    const gastos = await getGastos()
    return NextResponse.json(gastos)
  } catch (err) {
    console.error('Erro ao buscar gastos:', err)
    return NextResponse.json(
      { error: 'Erro ao buscar dados da planilha.' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { data, descricao, categoria, valor, formaPagamento } = body

    if (!data || !descricao || !categoria || valor == null || !formaPagamento) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios.' },
        { status: 400 }
      )
    }

    await appendGasto({ data, descricao, categoria, valor: Number(valor), formaPagamento })
    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('Erro ao salvar gasto:', err)
    return NextResponse.json(
      { error: 'Erro ao salvar na planilha.' },
      { status: 500 }
    )
  }
}
