import React from 'react'

export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md rounded-2xl border border-gray-100">
      <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-primary-500" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{message}</p>
    </div>
  )
}
