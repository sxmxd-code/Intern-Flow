import React from 'react'
import GlassCard from './GlassCard'

export default function StatCard({ icon: Icon, label, value, sublabel, iconColor = "text-primary-600", iconBg = "bg-primary-50" }) {
  return (
    <GlassCard>
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {sublabel && (
            <p className="text-sm text-gray-500 mt-1">{sublabel}</p>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
