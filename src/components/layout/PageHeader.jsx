import React from 'react'

export default function PageHeader({ title, description, children }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/40 p-6 rounded-2xl backdrop-blur-md border border-gray-100 shadow-sm">
      <div>
        <h1 className="text-3xl font-bold font-heading text-gray-900 mb-1">{title}</h1>
        {description && <p className="text-gray-500 text-sm">{description}</p>}
      </div>
      {children && (
        <div className="flex-shrink-0 w-full md:w-auto">
          {children}
        </div>
      )}
    </div>
  )
}
