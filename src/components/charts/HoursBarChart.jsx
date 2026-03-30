import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function HoursBarChart({ data }) {
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="h-72 flex items-center justify-center text-gray-400">
        No hours logged this week
      </div>
    )
  }

  if (!isClient) return <div className="h-72 w-full" />

  return (
    <div className="h-72 w-full relative min-w-0" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="99%" height={288}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dy={10}
            tickFormatter={(val) => val.split(' ')[0]} // First name only
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-100 shadow-xl rounded-xl">
                    <p className="font-semibold text-gray-900 mb-1">{payload[0].payload.name}</p>
                    <p className="text-sm text-primary-600 font-medium">
                      {payload[0].value} hours
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar 
            dataKey="hours" 
            fill="#3B82F6" 
            radius={[6, 6, 6, 6]}
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
