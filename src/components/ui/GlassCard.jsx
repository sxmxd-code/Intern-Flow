import React from 'react'

export default function GlassCard({ children, className = '', hoverLift = true, ...props }) {
  return (
    <div 
      className={`glass rounded-2xl p-6 transition-transform duration-300 ${hoverLift ? 'hover:-translate-y-1' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
