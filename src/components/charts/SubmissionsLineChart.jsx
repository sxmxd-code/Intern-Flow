import React from 'react'
import { Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'

export default function SubmissionsLineChart({ data }) {
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-400">
        No submissions in last 30 days
      </div>
    )
  }

  // Data expects: [{ date: '2023-10-01', count: 5 }]
  const chartData = data.map(day => ({
    ...day,
    displayDate: format(parseISO(day.date), 'MMM d')
  }))

  if (!isClient) return <div className="h-72 w-full" />

  return (
    <div className="h-72 w-full relative min-w-0" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="99%" height={288}>
        <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="displayDate" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dy={10}
            minTickGap={20}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-100 shadow-xl rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{payload[0].payload.displayDate}</p>
                    <p className="font-semibold text-primary-700">
                      {payload[0].value} logs
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: '#10B981', stroke: '#FFFFFF', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
