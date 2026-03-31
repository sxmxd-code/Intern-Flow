import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function HoursBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full min-h-[160px] flex items-center justify-center text-gray-400 text-sm">
        No hours logged this week
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 4 }} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          dy={6}
          tickFormatter={val => val.split(' ')[0]}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          width={28}
        />
        <Tooltip
          cursor={{ fill: 'rgba(99,102,241,0.05)' }}
          contentStyle={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            fontSize: 13,
          }}
          formatter={(value) => [`${value}h`, 'Hours']}
        />
        <Bar dataKey="hours" fill="#6366F1" radius={[5, 5, 0, 0]} animationDuration={800} />
      </BarChart>
    </ResponsiveContainer>
  )
}
