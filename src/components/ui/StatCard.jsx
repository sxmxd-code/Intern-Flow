import React from 'react'
import GlassCard from './GlassCard'

export default function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  iconColor = 'text-indigo-600',
  iconBg    = 'bg-indigo-50',
}) {
  return (
    <GlassCard hoverLift={false}>
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">{label}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
          {sublabel && <p className="text-xs text-gray-400 mt-1 truncate">{sublabel}</p>}
        </div>
      </div>
    </GlassCard>
  )
}
