'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, PlusCircle } from 'lucide-react'
import { CATEGORIAS, FORMAS_PAGAMENTO } from '@/lib/constants'

function todayBR() {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function NovoGastoPage() {
  const [form, setForm] = useState({
    data: todayBR(),
    descricao: '',
    categoria: '',
    valor: '',
    formaPagamento: '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (status === 'error') setStatus('idle')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const valor = parseFloat(form.valor.replace(',', '.'))
    if (isNaN(valor) || valor <= 0) {
      setErrorMsg('Informe um valor válido.')
      setStatus('error')
      return
    }

    try {
      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, valor }),
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Erro desconhecido')
      }
      setStatus('success')
      setForm({
        data: todayBR(),
        descricao: '',
        categoria: '',
        valor: '',
        formaPagamento: '',
      })
      setTimeout(() => setStatus('idle'), 4000)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Erro ao salvar.')
      setStatus('error')
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold gradient-text">Novo Gasto</h1>
        <p className="text-gray-500 text-sm mt-1">
          Registre um lançamento diretamente na planilha
        </p>
      </div>

      <div className="card p-6">
        {status === 'success' ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="text-emerald-400 mb-4" size={48} />
            <p className="text-lg font-semibold text-white">Gasto registrado!</p>
            <p className="text-sm text-gray-500 mt-1">
              O lançamento foi salvo na planilha com sucesso.
            </p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-6 px-5 py-2 rounded-xl bg-gray-800 text-sm text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              Registrar outro
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Data */}
            <Field label="Data">
              <input
                type="text"
                name="data"
                value={form.data}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                pattern="\d{2}/\d{2}/\d{4}"
                required
                className={inputCls}
              />
            </Field>

            {/* Descrição */}
            <Field label="Descrição">
              <input
                type="text"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                placeholder="Ex: Almoço no restaurante"
                required
                className={inputCls}
              />
            </Field>

            {/* Categoria */}
            <Field label="Categoria">
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                className={selectCls}
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            {/* Valor */}
            <Field label="Valor (R$)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  R$
                </span>
                <input
                  type="text"
                  name="valor"
                  value={form.valor}
                  onChange={handleChange}
                  placeholder="0,00"
                  required
                  className={`${inputCls} pl-10`}
                />
              </div>
            </Field>

            {/* Forma de Pagamento */}
            <Field label="Forma de Pagamento">
              <select
                name="formaPagamento"
                value={form.formaPagamento}
                onChange={handleChange}
                required
                className={selectCls}
              >
                <option value="" disabled>
                  Selecione…
                </option>
                {FORMAS_PAGAMENTO.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </Field>

            {/* Error */}
            {status === 'error' && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                {errorMsg}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 mt-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Salvando…
                </>
              ) : (
                <>
                  <PlusCircle size={16} />
                  Registrar Gasto
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all'

const selectCls =
  'w-full bg-gray-800 border border-gray-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all'
