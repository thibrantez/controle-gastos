/**
 * Script de build do app desktop.
 *
 * Passos:
 *   1. next build  (gera .next/standalone)
 *   2. Copia .next/static  → .next/standalone/.next/static
 *   3. Copia public/        → .next/standalone/public
 *   4. Copia .env.local    → .next/standalone/.env.local
 *   5. electron-builder --win
 *
 * Uso:
 *   node scripts/build-electron.mjs
 */

import { execSync } from 'child_process'
import { cpSync, copyFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const root = resolve(process.cwd())
const standalone = resolve(root, '.next', 'standalone')

// Desabilitar assinatura de código (não necessária para uso pessoal
// e evita erros de symlink no Windows sem Developer Mode)
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false'
process.env.WIN_CSC_IDENTITY_AUTO_DISCOVERY = 'false'

function run(cmd) {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, { stdio: 'inherit', cwd: root, env: process.env })
}

function copy(src, dest) {
  const from = resolve(root, src)
  const to = resolve(standalone, dest)
  if (!existsSync(from)) {
    console.warn(`⚠  Ignorado (não existe): ${src}`)
    return
  }
  console.log(`  cópia: ${src} → standalone/${dest}`)
  cpSync(from, to, { recursive: true, force: true })
}

// 1. Build Next.js
console.log('\n══════════════════════════════════════════')
console.log('  1/3  Next.js build')
console.log('══════════════════════════════════════════')
run('npx next build')

// 2. Copiar assets estáticos para o standalone
console.log('\n══════════════════════════════════════════')
console.log('  2/3  Copiando assets')
console.log('══════════════════════════════════════════')
copy('.next/static', '.next/static')
copy('public', 'public')

// Copiar .env.local se existir
const envSrc = resolve(root, '.env.local')
const envDest = resolve(standalone, '.env.local')
if (existsSync(envSrc)) {
  copyFileSync(envSrc, envDest)
  console.log('  cópia: .env.local → standalone/.env.local')
} else {
  console.warn('⚠  .env.local não encontrado — lembre de configurar as variáveis no app instalado')
}

// 3. Gerar instalador com electron-builder
console.log('\n══════════════════════════════════════════')
console.log('  3/3  Gerando instalador Windows')
console.log('══════════════════════════════════════════')
run('npx electron-builder --win')

console.log('\n✅  Build concluído! Instalador em: dist-electron/')
