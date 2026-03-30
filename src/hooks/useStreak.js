import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { differenceInCalendarDays, parseISO, startOfDay, subDays } from 'date-fns'

export const useStreak = (userId) => {
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchStreak = async () => {
      try {
        const { data, error } = await supabase
          .from('daily_logs')
          .select('log_date')
          .eq('intern_id', userId)
          .order('log_date', { ascending: false })

        if (error) throw error

        if (!data || data.length === 0) {
          setStreak(0)
          return
        }

        const dates = data.map(d => startOfDay(parseISO(d.log_date)))
        
        let currentStreak = 0
        const today = startOfDay(new Date())
        const yesterday = subDays(today, 1)

        // Check if latest date is today or yesterday
        const latestLogDate = dates[0]
        
        if (latestLogDate.getTime() === today.getTime() || latestLogDate.getTime() === yesterday.getTime()) {
          currentStreak = 1
          
          let checkDate = latestLogDate
          for (let i = 1; i < dates.length; i++) {
            const nextDate = dates[i]
            const diff = differenceInCalendarDays(checkDate, nextDate)
            
            if (diff === 1) {
              currentStreak++
              checkDate = nextDate
            } else if (diff === 0) {
              // Multiple logs on same date, ignore
            } else {
              break // Streak broken
            }
          }
        }

        setStreak(currentStreak)
      } catch (err) {
        console.error('Error fetching streak:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStreak()
  }, [userId])

  return { streak, loading }
}
