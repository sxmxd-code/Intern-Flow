import React from 'react'
import { Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts'
import { format, parseISO } from 'date-fns'

export default function SubmissionsLineChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-full min-h-[160px] flex items-center justify-center text-gray-400 text-sm">
        No submissions in last 30 days
      </div>
    )
  }

  const chartData = data.map(day => ({
    ...day,
    displayDate: format(parseISO(day.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
        <defs>
          <linearGradient id="submissionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
        <XAxis
          dataKey="displayDate"
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          dy={6}
          minTickGap={24}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#9CA3AF', fontSize: 11 }}
          allowDecimals={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: 12,
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            fontSize: 13,
          }}
          formatter={(value) => [value, 'Logs']}
          labelFormatter={label => label}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#10B981"
          strokeWidth={2.5}
          fill="url(#submissionsGradient)"
          dot={false}
          activeDot={{ r: 5, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }}
          animationDuration={800}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
