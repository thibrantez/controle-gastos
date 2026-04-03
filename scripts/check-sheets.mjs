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

console.log('\n── Variáveis carregadas ─────────────────────────────')
console.log('CLIENT_ID:      ', CLIENT_ID ? `${CLIENT_ID.slice(0, 30)}...` : '❌ MISSING')
console.log('CLIENT_SECRET:  ', CLIENT_SECRET ? `${CLIENT_SECRET.slice(0, 10)}...` : '❌ MISSING')
console.log('REFRESH_TOKEN:  ', REFRESH_TOKEN ? `${REFRESH_TOKEN.slice(0, 20)}...` : '❌ MISSING')
console.log('SPREADSHEET_ID: ', SPREADSHEET_ID ?? '❌ MISSING')

// 1. Obter access token
console.log('\n── Obtendo access token... ──────────────────────────')
const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token',
  }),
})
const tokenData = await tokenRes.json()

if (tokenData.error) {
  console.error('❌ Erro ao obter token:', tokenData.error, '-', tokenData.error_description)
  process.exit(1)
}
console.log('✅ Access token obtido com sucesso')

const accessToken = tokenData.access_token

// 2. Buscar metadados da planilha
console.log('\n── Buscando metadados da planilha... ────────────────')
const metaRes = await fetch(
  `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}?fields=properties.title,sheets.properties.title`,
  { headers: { Authorization: `Bearer ${accessToken}` } }
)
const metaData = await metaRes.json()

if (metaData.error) {
  console.error('❌ Erro ao acessar planilha:', metaData.error.code, '-', metaData.error.message)
  console.error('   Verifique se o ID da planilha está correto e se foi compartilhada com o usuário autenticado.')
  process.exit(1)
}

console.log('✅ Planilha encontrada:', metaData.properties?.title)
console.log('\n── Abas disponíveis ─────────────────────────────────')
for (const sheet of metaData.sheets ?? []) {
  console.log('  •', sheet.properties.title)
}
console.log('─────────────────────────────────────────────────────\n')
