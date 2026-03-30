import React from 'react'
import { format, subDays, startOfWeek, eachDayOfInterval, formatISO } from 'date-fns'

export default function HeatmapGrid({ logs }) {
  // Generate last 35 days (5 weeks)
  const today = new Date()
  const startDate = startOfWeek(subDays(today, 28), { weekStartsOn: 1 }) // Last 5 weeks including current
  
  const days = eachDayOfInterval({ start: startDate, end: today })
  
  // Transform logs into map of date string -> hours
  const logMap = (logs || []).reduce((acc, log) => {
    acc[log.log_date] = log.hours_worked
    return acc
  }, {})

  const getColorClass = (hours) => {
    if (!hours || hours === 0) return 'bg-gray-100' // 0 = gray
    if (hours <= 3) return 'bg-blue-200' // 1-3 = light blue
    if (hours <= 6) return 'bg-blue-400' // 4-6 = medium blue
    if (hours <= 9) return 'bg-blue-600' // 7-9 = dark blue
    return 'bg-blue-800' // 10+ = deepest blue
  }

  // Group by week (7 days) for columns
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className="w-full flex items-end overflow-x-auto pb-4 gap-1.5 hide-scrollbar">
      {weeks.map((week, wIndex) => (
        <div key={wIndex} className="flex flex-col gap-1.5">
          {week.map((day, dIndex) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const hours = logMap[dateStr] || 0
            
            return (
              <div
                key={dateStr}
                v-tooltip={`${format(day, 'MMM d')}: ${hours}h`}
                className={`w-4 h-4 rounded-sm ${getColorClass(hours)} transition-all duration-300 hover:ring-2 hover:ring-offset-1 hover:ring-gray-300 cursor-pointer group relative`}
              >
                <div className="absolute z-10 hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900/90 backdrop-blur-sm text-xs text-white rounded whitespace-nowrap shadow-xl">
                  {format(day, 'MMM d')}: {hours}h
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
