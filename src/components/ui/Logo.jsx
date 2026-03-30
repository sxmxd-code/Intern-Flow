import React from 'react'
import { Zap } from 'lucide-react'

export default function Logo({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${sizes[size]} rounded-lg bg-gradient-to-br from-primary-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary-200/50`}>
        <Zap className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5'} fill-current`} />
      </div>
      <span className={`${textSizes[size]} font-bold font-heading text-gray-900 tracking-tight`}>
        Intern<span className="text-primary-600 mx-px">~</span>Flow
      </span>
    </div>
  )
}
