import { LucideIcon } from 'lucide-react'

interface KPICardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  gradient?: string
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-400',
  gradient = 'from-blue-500/10 to-purple-500/10',
}: KPICardProps) {
  return (
    <div className={`card card-hover p-6 bg-gradient-to-br ${gradient}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-xl bg-gray-800/80 flex items-center justify-center shrink-0`}
        >
          <Icon className={iconColor} size={20} />
        </div>
      </div>
    </div>
  )
}
