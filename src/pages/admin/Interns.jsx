import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
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

  useEffect(() => { fetchInterns() }, [])

  const fetchInterns = async () => {
    try {
      const [{ data: usersData, error: usersError }, { data: logsData, error: logsError }] = await Promise.all([
        supabase.from('users').select('*').eq('role', 'intern').order('full_name'),
        supabase.from('daily_logs').select('*').order('log_date', { ascending: false }),
      ])
      if (usersError) throw usersError
      if (logsError)  throw logsError

      const processedInterns = (usersData || []).map(intern => {
        const internLogs = (logsData || []).filter(l => l.intern_id === intern.id)
        let streak = 0
        if (internLogs.length > 0) {
          const dates = internLogs.map(d => startOfDay(parseISO(d.log_date)))
          const today = startOfDay(new Date())
          const yesterday = subDays(today, 1)
          const latest = dates[0]
          if (latest.getTime() === today.getTime() || latest.getTime() === yesterday.getTime()) {
            streak = 1
            let check = latest
            for (let i = 1; i < dates.length; i++) {
              const diff = differenceInCalendarDays(check, dates[i])
              if (diff === 1) { streak++; check = dates[i] }
              else if (diff === 0) continue
              else break
            }
          }
        }
        const avgScore = internLogs.length > 0
          ? (internLogs.reduce((a, l) => a + Number(l.productivity_score), 0) / internLogs.length).toFixed(1) : 0
        const lastLogDate = internLogs[0]?.log_date || null
        const isActive = lastLogDate && differenceInCalendarDays(new Date(), parseISO(lastLogDate)) <= 7
        return { ...intern, streak, avgScore, lastLogDate, recentLogs: internLogs.slice(0, 5), isActive }
      })
      setInterns(processedInterns)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const filtered = interns.filter(i =>
    i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    i.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      <PageHeader title="Interns" description="View all interns and their recent activity" />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-400 outline-none"
        />
      </div>

      {/* Intern cards — card layout instead of table for mobile */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            No interns found{search && ` for "${search}"`}.
          </div>
        ) : (
          filtered.map(intern => {
            const isExpanded = expandedRow === intern.id
            return (
              <GlassCard key={intern.id} hoverLift={false}>
                {/* Intern summary row */}
                <button
                  onClick={() => setExpandedRow(isExpanded ? null : intern.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {intern.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm truncate">{intern.full_name}</p>
                        <p className="text-xs text-gray-400 truncate">{intern.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${intern.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {intern.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {intern.streak > 0 && (
                        <span className="text-orange-500 text-xs font-bold">🔥{intern.streak}</span>
                      )}
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                    <span>Avg: <strong className="text-indigo-600">{intern.avgScore}/10</strong></span>
                    <span>Last: <strong className="text-gray-700">{intern.lastLogDate ? format(parseISO(intern.lastLogDate), 'MMM d') : 'Never'}</strong></span>
                    <span>Logs: <strong className="text-gray-700">{intern.recentLogs.length}+</strong></span>
                  </div>
                </button>

                {/* Expanded log details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">Recent Logs</h4>
                    {intern.recentLogs.length === 0 ? (
                      <p className="text-sm text-gray-400">No logs yet.</p>
                    ) : (
                      intern.recentLogs.map(log => (
                        <div key={log.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                          {/* Log header */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800">
                              {format(parseISO(log.log_date), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-gray-500">{log.hours_worked}h worked</span>
                            <span className="text-xs text-indigo-600 font-bold">Score: {log.productivity_score}</span>
                            <MoodBadge mood={log.mood} />
                            {log.blockers?.trim() && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase">Blocked</span>
                            )}
                          </div>

                          {/* Tasks */}
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Tasks</p>
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {log.tasks_completed || <span className="text-gray-400 italic">No description.</span>}
                            </p>
                          </div>

                          {/* Blockers */}
                          {log.blockers?.trim() && (
                            <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                              <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">Blockers</p>
                              <p className="text-xs text-red-800 whitespace-pre-wrap">{log.blockers}</p>
                            </div>
                          )}

                          {/* Admin feedback */}
                          {log.admin_feedback && (
                            <div className="bg-indigo-50 rounded-lg p-2.5 border border-indigo-100 flex gap-2">
                              <MessageSquare size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-0.5">Admin Note</p>
                                <p className="text-xs text-indigo-900 font-semibold whitespace-pre-wrap">{log.admin_feedback}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </GlassCard>
            )
          })
        )}
      </div>
    </div>
  )
}
