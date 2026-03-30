import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, parseISO, differenceInCalendarDays, startOfDay, subDays } from 'date-fns'
import PageHeader from '../../components/layout/PageHeader'
import GlassCard from '../../components/ui/GlassCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import MoodBadge from '../../components/ui/MoodBadge'

export default function AdminInterns() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  useEffect(() => {
    fetchInterns()
  }, [])

  const fetchInterns = async () => {
    try {
      // Fetch interns
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'intern')
        .order('full_name', { ascending: true })
      
      if (usersError) throw usersError

      // Fetch all logs
      const { data: logsData, error: logsError } = await supabase
        .from('daily_logs')
        .select('*')
        .order('log_date', { ascending: false })

      if (logsError) throw logsError

      // Process stats per intern
      const processedInterns = usersData.map(intern => {
        const internLogs = logsData.filter(l => l.intern_id === intern.id)
        
        // Calculate streak
        let currentStreak = 0
        if (internLogs.length > 0) {
          const dates = internLogs.map(d => startOfDay(parseISO(d.log_date)))
          const today = startOfDay(new Date())
          const yesterday = subDays(today, 1)
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
                // Same day, ignored
              } else {
                break
              }
            }
          }
        }

        // Avg Score overall
        const avgScore = internLogs.length > 0 
          ? (internLogs.reduce((acc, l) => acc + Number(l.productivity_score), 0) / internLogs.length).toFixed(1) 
          : 0

        const lastLogDate = internLogs.length > 0 ? internLogs[0].log_date : null
        
        // Status: Active if logged in last 7 days
        const isActive = lastLogDate && differenceInCalendarDays(new Date(), parseISO(lastLogDate)) <= 7

        return {
          ...intern,
          streak: currentStreak,
          avgScore,
          lastLogDate,
          recentLogs: internLogs.slice(0, 5),
          isActive
        }
      })

      setInterns(processedInterns)
    } catch (error) {
      console.error('Error fetching interns:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  if (loading) return <LoadingSpinner />

  const filteredInterns = interns.filter(i => 
    i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-fade-in">
      <PageHeader 
        title="Interns Directory" 
        description="View all interns, their stats, and recent activity" 
      />

      <GlassCard className="p-4 border border-gray-200" hoverLift={false}>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 w-full rounded-xl border border-gray-200 bg-white/50 focus:bg-white p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            placeholder="Search internals by name or email..."
          />
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden p-0 border border-gray-200" hoverLift={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Streak</th>
                <th className="px-6 py-4">Avg Score</th>
                <th className="px-6 py-4">Last Log</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInterns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    No interns found matching "{search}"
                  </td>
                </tr>
              ) : (
                filteredInterns.map((intern) => {
                  const isExpanded = expandedRow === intern.id
                  return (
                    <React.Fragment key={intern.id}>
                      <tr 
                        className="hover:bg-primary-50/30 transition-colors cursor-pointer group"
                        onClick={() => toggleRow(intern.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-bold flex items-center justify-between">
                          {intern.full_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {intern.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-orange-600">
                          {intern.streak > 0 ? `🔥 ${intern.streak}` : '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-primary-700 font-semibold">
                          {intern.avgScore}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {intern.lastLogDate ? format(parseISO(intern.lastLogDate), 'MMM d, yyyy') : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex justify-between items-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            intern.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                          } border shadow-sm`}>
                            {intern.isActive ? 'Active' : 'Inactive'}
                          </span>
                          <span className="text-gray-400 group-hover:text-primary-600">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </span>
                        </td>
                      </tr>

                      {/* Expanded View */}
                      {isExpanded && (
                        <tr className="bg-gray-50/50 shadow-inner">
                          <td colSpan="6" className="px-8 py-6">
                            <h4 className="font-bold font-heading text-gray-900 mb-4 border-b pb-2 border-gray-200">Recent Logs (Last 5)</h4>
                            {intern.recentLogs.length === 0 ? (
                              <p className="text-gray-500 text-sm">This intern hasn't submitted any logs yet.</p>
                            ) : (
                              <div className="grid gap-3">
                                {intern.recentLogs.map(log => (
                                  <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col gap-1 w-1/4">
                                      <span className="text-xs font-medium text-gray-500">Date</span>
                                      <span className="font-semibold text-gray-900">{format(parseISO(log.log_date), 'MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex flex-col gap-1 w-1/4">
                                      <span className="text-xs font-medium text-gray-500">Hours</span>
                                      <span className="font-semibold text-gray-900">{log.hours_worked}h</span>
                                    </div>
                                    <div className="flex flex-col gap-1 w-1/4">
                                      <span className="text-xs font-medium text-gray-500">Score</span>
                                      <span className="font-semibold text-primary-600 flex items-center gap-1">{log.productivity_score} <MoodBadge mood={log.mood} /></span>
                                    </div>
                                    <div className="flex flex-col gap-1 w-1/4">
                                      <span className="text-xs font-medium text-gray-500">Blockers</span>
                                      {log.blockers ? (
                                        <span className="text-sm text-red-600 truncate max-w-[150px]" title={log.blockers}>{log.blockers}</span>
                                      ) : (
                                        <span className="text-sm text-green-600">None</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
