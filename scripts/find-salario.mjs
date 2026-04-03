import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}
loadEnv()

const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, SPREADSHEET_ID } = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  SPREADSHEET_ID: process.env.GOOGLE_SPREADSHEET_ID,
}

const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN, grant_type: 'refresh_token',
  }),
})
const { access_token } = await tokenRes.json()

// Ler um bloco amplo para achar o label
const res = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'Gastos %26 Dashboard'!A1:H30`,
  { headers: { Authorization: `Bearer ${access_token}` } }
)
const data = await res.json()
const rows = data.values ?? []

console.log('\n── Primeiras 30 linhas de A:H ───────────────────────')
rows.forEach((row, i) => {
  const hasKeyword = row.some(c =>
    String(c).toLowerCase().includes('salário') ||
    String(c).toLowerCase().includes('salario') ||
    String(c).toLowerCase().includes('receita') ||
    String(c).toLowerCase().includes('saldo') ||
    String(c).toLowerCase().includes('orçamento') ||
    String(c).toLowerCase().includes('orcamento')
  )
  if (hasKeyword || i < 8) {
    console.log(`Linha ${String(i + 1).padStart(2)}: ${JSON.stringify(row)}`)
  }
})
