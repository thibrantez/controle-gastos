'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  History,
  PlusCircle,
  BarChart3,
  CalendarDays,
  Settings,
  Sun,
  Moon,
  Wallet,
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/historico', label: 'Histórico', icon: History },
  { href: '/novo-gasto', label: 'Novo Gasto', icon: PlusCircle },
  { href: '/resumo-mensal', label: 'Resumo Mensal', icon: BarChart3 },
  { href: '/resumo-anual', label: 'Resumo Anual', icon: CalendarDays },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <aside className="w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">Controle</p>
            <p className="text-xs text-gray-400 leading-tight">de Gastos</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 ${
                  active ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                }`}
                size={18}
              />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />}
            </Link>
          )
        })}
      </nav>

      {/* Theme toggle */}
      <div className="px-3 pb-2">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-150"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-gray-500 shrink-0" />
          ) : (
            <Moon size={18} className="text-gray-500 shrink-0" />
          )}
          {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <p className="text-xs text-gray-600 text-center">Dados via Google Sheets</p>
      </div>
    </aside>
  )
}
