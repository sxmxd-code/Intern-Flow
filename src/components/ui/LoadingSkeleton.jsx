import React from 'react'

export default function LoadingSkeleton({ count = 1, className = "h-12 w-full mb-4" }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse bg-gray-200 rounded-xl ${className}`}></div>
      ))}
    </>
  )
}
