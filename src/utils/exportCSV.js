import { format } from 'date-fns'

export const exportToCSV = (data, filenamePrefix = 'internflow_export') => {
  if (!data || !data.length) return
  
  // Headers match the requested CSV columns
  const headers = [
    'intern_name', 
    'email', 
    'project_name', 
    'log_date', 
    'tasks_completed', 
    'hours_worked', 
    'mood', 
    'productivity_score', 
    'blockers'
  ]

  // Convert objects to CSV array
  const csvRows = []
  
  // Header row
  csvRows.push(headers.join(','))
  
  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] === null || row[header] === undefined ? '' : String(row[header])
      
      // Escape quotes and wrap in quotes if contains comma, newline, or quotes
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`
      }
      return val
    })
    
    csvRows.push(values.join(','))
  }
  
  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  const dateStr = format(new Date(), 'yyyy-MM-dd')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filenamePrefix}_${dateStr}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
