import React from 'react'

export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 truncate">{title}</h1>
        {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
      </div>
      {children && (
        <div className="flex-shrink-0 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  )
}
