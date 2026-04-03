/**
 * Script de autorização OAuth2 — execute uma única vez para obter o refresh_token.
 *
 * Uso:
 *   node scripts/get-token.mjs
 */

import { createServer } from 'http'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

// Carregar .env.local manualmente
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

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const PORT = 3000
const REDIRECT_URI = `http://localhost:${PORT}`
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets'

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('\n❌  GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET não encontrados no .env.local\n')
  process.exit(1)
}

// Importante: o redirect URI http://localhost:3000 deve estar cadastrado no
// Google Cloud Console → Credenciais → seu OAuth Client → URIs de redirecionamento autorizados.

const authUrl =
  `https://accounts.google.com/o/oauth2/v2/auth` +
  `?client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPE)}` +
  `&access_type=offline` +
  `&prompt=consent`

console.log('\n──────────────────────────────────────────────────────')
console.log('  Autorização Google OAuth2')
console.log('──────────────────────────────────────────────────────')
console.log('\nAbrindo servidor em http://localhost:' + PORT + ' ...')
console.log('\nAbra esta URL no navegador:\n')
console.log('  ' + authUrl)
console.log('\nAguardando o retorno do Google...\n')

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<h2 style="font-family:sans-serif;color:#e53e3e">❌ Erro: ${error}</h2>`)
    server.close()
    console.error('\n❌  Acesso negado pelo usuário:', error)
    process.exit(1)
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Aguardando código...')
    return
  }

  // Trocar code por tokens
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })

    const data = await tokenRes.json()

    if (data.error) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(`<h2 style="font-family:sans-serif;color:#e53e3e">❌ ${data.error_description ?? data.error}</h2>`)
      server.close()
      console.error('\n❌  Erro ao trocar código:', data.error_description ?? data.error)
      process.exit(1)
    }

    // Sucesso — mostrar página e imprimir no terminal
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Token obtido</title>
<style>
  body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; display: flex;
         align-items: center; justify-content: center; height: 100vh; margin: 0; }
  .box { background: #1e293b; border: 1px solid #334155; border-radius: 12px;
         padding: 32px 40px; max-width: 520px; text-align: center; }
  h2 { color: #4ade80; margin-top: 0; }
  code { background: #0f172a; padding: 12px 16px; border-radius: 8px; display: block;
         word-break: break-all; font-size: 13px; color: #a5b4fc; margin: 16px 0; }
  p { color: #94a3b8; font-size: 14px; }
</style></head>
<body><div class="box">
  <h2>✅ Token obtido com sucesso!</h2>
  <p>Adicione ao <strong>.env.local</strong>:</p>
  <code>GOOGLE_REFRESH_TOKEN=${data.refresh_token}</code>
  <p>Você pode fechar esta aba.</p>
</div></body></html>`)

    server.close()

    console.log('──────────────────────────────────────────────────────')
    console.log('  ✅  Token obtido com sucesso!')
    console.log('──────────────────────────────────────────────────────')
    console.log('\nAdicione ao .env.local:\n')
    console.log(`GOOGLE_REFRESH_TOKEN=${data.refresh_token}`)
    console.log('\n──────────────────────────────────────────────────────\n')
  } catch (err) {
    res.writeHead(500)
    res.end('Erro interno')
    server.close()
    console.error('\n❌  Falha na requisição:', err.message)
    process.exit(1)
  }
})

server.listen(PORT, () => {
  // Tentar abrir o navegador automaticamente
  const { platform } = process
  const open = platform === 'win32' ? 'start' :
                platform === 'darwin' ? 'open' : 'xdg-open'
  import('child_process').then(({ exec }) => exec(`${open} "${authUrl}"`))
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌  A porta ${PORT} já está em uso. Encerre o processo que a ocupa e tente novamente.\n`)
  } else {
    console.error('\n❌  Erro no servidor:', err.message)
  }
  process.exit(1)
})
