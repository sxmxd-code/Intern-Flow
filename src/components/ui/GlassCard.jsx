import React from 'react'

export default function GlassCard({ children, className = '', hoverLift = true, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 transition-all duration-200 ${
        hoverLift ? 'hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  )
}
