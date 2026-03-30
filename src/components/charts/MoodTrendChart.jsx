import React from 'react'
import { Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import { format, parseISO } from 'date-fns'

const moodTextToNumber = {
  'struggling': 1,
  'okay': 2,
  'good': 3,
  'great': 4
}

const formatMood = (val) => {
  const map = { 1: 'Struggling', 2: 'Okay', 3: 'Good', 4: 'Great' }
  return map[val] || ''
}

export default function MoodTrendChart({ data }) {
  const [isClient, setIsClient] = React.useState(false)
  
  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No mood data available yet
      </div>
    )
  }

  const chartData = [...data].reverse().map(log => ({
    date: format(parseISO(log.log_date), 'MMM d'),
    moodValue: moodTextToNumber[log.mood] || 2,
    rawMood: log.mood
  }))

  if (!isClient) return <div className="h-64 w-full" />

  return (
    <div className="h-64 w-full relative min-w-0" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="99%" height={256}>
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6B7280', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            domain={[1, 4]} 
            ticks={[1, 2, 3, 4]} 
            tickFormatter={formatMood}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white/90 backdrop-blur-sm p-3 border border-gray-100 shadow-xl rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">{payload[0].payload.date}</p>
                    <p className="font-semibold text-primary-700 capitalize">
                      {payload[0].payload.rawMood}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line 
            type="monotone" 
            dataKey="moodValue" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={{ r: 6, fill: '#3B82F6', strokeWidth: 2, stroke: '#FFFFFF' }}
            activeDot={{ r: 8, fill: '#1d4ed8', stroke: '#FFFFFF', strokeWidth: 2 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
