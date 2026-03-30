import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export const formatDate = (dateString, formatStr = 'MMM d, yyyy') => {
  if (!dateString) return ''
  return format(parseISO(dateString), formatStr)
}

export const getWeekDays = (date = new Date()) => {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // Monday
  const end = endOfWeek(date, { weekStartsOn: 1 }) // Sunday
  return eachDayOfInterval({ start, end })
}
