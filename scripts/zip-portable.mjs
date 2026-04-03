/**
 * Gera um ZIP portátil do app em vez do instalador NSIS.
 * Não requer Developer Mode nem privilégios de administrador.
 *
 * Uso:
 *   node scripts/zip-portable.mjs
 *
 * Saída:
 *   dist-electron/Controle-de-Gastos-portable.zip
 */

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import { resolve } from 'path'

const root = resolve(process.cwd())
const unpacked = resolve(root, 'dist-electron', 'win-unpacked')
const output = resolve(root, 'dist-electron', 'Controle-de-Gastos-portable.zip')

if (!existsSync(unpacked)) {
  console.error('❌  dist-electron/win-unpacked não encontrado.')
  console.error('   Execute primeiro: node scripts/build-electron.mjs')
  process.exit(1)
}

console.log('\n══════════════════════════════════════════')
console.log('  Gerando ZIP portátil')
console.log('══════════════════════════════════════════\n')
console.log(`  origem:  dist-electron/win-unpacked/`)
console.log(`  destino: dist-electron/Controle-de-Gastos-portable.zip\n`)

// Usar PowerShell Compress-Archive (nativo no Windows, sem dependências)
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${unpacked}\\*' -DestinationPath '${output}' -Force"`,
  { stdio: 'inherit' }
)

console.log('\n✅  ZIP gerado com sucesso!')
console.log(`    ${output}\n`)
console.log('Para usar: extraia o ZIP e execute "Controle de Gastos.exe"\n')
