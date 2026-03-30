import React from 'react'

export default function MoodBadge({ mood }) {
  const styles = {
    great: "bg-green-100 text-green-800 border-green-200",
    good: "bg-blue-100 text-blue-800 border-blue-200",
    okay: "bg-yellow-100 text-yellow-800 border-yellow-200",
    struggling: "bg-red-100 text-red-800 border-red-200"
  }
  
  const formattedMood = mood ? mood.charAt(0).toUpperCase() + mood.slice(1) : 'Unknown'

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[mood] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
      {formattedMood}
    </span>
  )
}
