import 'server-only'
import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import type { Gasto } from './constants'
import { MESES_PT } from './constants'

export type { Gasto }
export { MESES_PT, mesLabel } from './constants'
export { CATEGORIAS, FORMAS_PAGAMENTO } from './constants'

function getAuth(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  console.log('[getAuth] GOOGLE_CLIENT_ID      :', clientId ? `${clientId.slice(0, 20)}...` : 'AUSENTE')
  console.log('[getAuth] GOOGLE_CLIENT_SECRET  :', clientSecret ? `${clientSecret.slice(0, 6)}...` : 'AUSENTE')
  console.log('[getAuth] GOOGLE_REFRESH_TOKEN  :', refreshToken ? `${refreshToken.slice(0, 20)}...` : 'AUSENTE')

  const client = new google.auth.OAuth2(clientId, clientSecret)
  client.setCredentials({ refresh_token: refreshToken })

  // Intercepta o evento de refresh para logar o resultado exato do Google
  client.on('tokens', (tokens) => {
    console.log('[getAuth] tokens recebidos após refresh:',
      JSON.stringify({
        access_token: tokens.access_token ? `${tokens.access_token.slice(0, 20)}...` : null,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope,
      })
    )
  })

  return client
}

async function getAccessToken(client: OAuth2Client): Promise<void> {
  console.log('[getAccessToken] solicitando access token ao Google...')
  try {
    const response = await client.getAccessToken()
    console.log('[getAccessToken] sucesso — token:', response.token ? `${response.token.slice(0, 20)}...` : 'nulo')
  } catch (err: unknown) {
    const e = err as { message?: string; response?: { status?: number; data?: unknown } }
    console.error('[getAccessToken] ERRO ao obter access token')
    console.error('[getAccessToken] message  :', e?.message)
    console.error('[getAccessToken] http status:', e?.response?.status)
    console.error('[getAccessToken] resposta Google:', JSON.stringify(e?.response?.data))
    throw err
  }
}

function parseValor(raw: string | undefined): number {
  if (!raw) return 0
  return parseFloat(
    String(raw).replace(/R\$\s*/g, '').replace(/\./g, '').replace(',', '.').trim()
  ) || 0
}

export async function getSalario(): Promise<number> {
  const auth = getAuth()
  await getAccessToken(auth)
  const sheets = google.sheets({ version: 'v4', auth })
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME ?? 'Gastos & Dashboard'

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!Q3`,
  })
  const raw = res.data.values?.[0]?.[0]
  return parseValor(raw)
}

export async function getGastos(): Promise<Gasto[]> {
  const auth = getAuth()
  await getAccessToken(auth)
  const sheets = google.sheets({ version: 'v4', auth })

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME ?? 'Gastos & Dashboard'

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A6:E`,
  })

  const rows = response.data.values ?? []

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/

  return rows
    .filter((row) => row[0] && dateRegex.test(String(row[0]).trim()) && row[3])
    .map((row, index) => ({
      id: index + 1,
      data: row[0] ?? '',
      descricao: row[1] ?? '',
      categoria: row[2] ?? 'Outros',
      valor: parseValor(row[3]),
      formaPagamento: row[4] ?? '',
    }))
}

export async function appendGasto(
  gasto: Omit<Gasto, 'id'>
): Promise<void> {
  const auth = getAuth()
  const sheets = google.sheets({ version: 'v4', auth })

  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID
  const sheetName = process.env.GOOGLE_SHEET_NAME ?? 'Gastos & Dashboard'

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `'${sheetName}'!A:E`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [
        [
          gasto.data,
          gasto.descricao,
          gasto.categoria,
          gasto.valor.toFixed(2).replace('.', ','),
          gasto.formaPagamento,
        ],
      ],
    },
  })
}

// ── Helpers de agregação ──────────────────────────────────────────────────────

export function totalPorCategoria(gastos: Gasto[]): Record<string, number> {
  return gastos.reduce<Record<string, number>>((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] ?? 0) + g.valor
    return acc
  }, {})
}

export function totalPorFormaPagamento(
  gastos: Gasto[]
): Record<string, number> {
  return gastos.reduce<Record<string, number>>((acc, g) => {
    acc[g.formaPagamento] = (acc[g.formaPagamento] ?? 0) + g.valor
    return acc
  }, {})
}

export function gastosMesAtual(gastos: Gasto[]): Gasto[] {
  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()
  return gastos.filter((g) => {
    const parts = g.data.split('/')
    if (parts.length < 3) return false
    return parseInt(parts[1]) === mes && parseInt(parts[2]) === ano
  })
}

export interface ResumoMensal {
  mes: string // "MM/YYYY"
  categorias: Record<string, number>
  total: number
}

export function resumoMensal(gastos: Gasto[]): ResumoMensal[] {
  const map = new Map<string, Record<string, number>>()

  for (const g of gastos) {
    const parts = g.data.split('/')
    if (parts.length < 3) continue
    const chave = `${parts[1]}/${parts[2]}`
    if (!map.has(chave)) map.set(chave, {})
    const cats = map.get(chave)!
    cats[g.categoria] = (cats[g.categoria] ?? 0) + g.valor
  }

  const result: ResumoMensal[] = []
  map.forEach((categorias, mes) => {
    const total = Object.values(categorias).reduce((s, v) => s + v, 0)
    result.push({ mes, categorias, total })
  })

  result.sort((a, b) => {
    const [ma, ya] = a.mes.split('/').map(Number)
    const [mb, yb] = b.mes.split('/').map(Number)
    return ya !== yb ? ya - yb : ma - mb
  })

  return result
}

function mesLabel(mesAno: string): string {
  const [m, y] = mesAno.split('/')
  return `${MESES_PT[parseInt(m) - 1]}/${y.slice(2)}`
}
