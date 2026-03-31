import React, { useState, useEffect } from 'react'
import { Filter, FileText, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'
import PageHeader from '../../components/layout/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import MoodBadge from '../../components/ui/MoodBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MyLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [moodFilter, setMoodFilter] = useState('')

  const fetchLogs = async () => {
    if (!user) return
    setLoading(true)
    try {
      let query = supabase
        .from('daily_logs')
        .select('id, log_date, tasks_completed, hours_worked, blockers, mood, productivity_score, admin_feedback, projects(name)')
        .eq('intern_id', user.id)
        .order('log_date', { ascending: false })

      if (startDate)  query = query.gte('log_date', startDate)
      if (endDate)    query = query.lte('log_date', endDate)
      if (moodFilter) query = query.eq('mood', moodFilter)

      const { data, error } = await query
      if (error) throw error
      setLogs(data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchLogs() }, [user])

  const resetFilters = () => {
    setStartDate('')
    setEndDate('')
    setMoodFilter('')
    setExpandedId(null)
    // need to wait for state to update
    setTimeout(fetchLogs, 0)
  }

  const toggle = (id) => setExpandedId(prev => prev === id ? null : id)

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-5 pb-10 animate-fade-in">
      <PageHeader title="My Logs" description="Your full activity history" />

      {/* ── Filters ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            />
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-semibold text-gray-500 mb-1">Mood</label>
            <select
              value={moodFilter}
              onChange={e => setMoodFilter(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
            >
              <option value="">All Moods</option>
              <option value="great">Great</option>
              <option value="good">Good</option>
              <option value="okay">Okay</option>
              <option value="struggling">Struggling</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={fetchLogs}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> Apply
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Log Cards ── */}
      {logs.length === 0 ? (
        <EmptyState icon={FileText} title="No logs found" message="Try adjusting your filters or log your first entry today." />
      ) : (
        <div className="space-y-2">
          {logs.map(log => {
            const isExpanded = expandedId === log.id
            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* ── Summary row — always visible ── */}
                <button
                  type="button"
                  onClick={() => toggle(log.id)}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Top meta row */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-gray-900 text-sm">
                          {format(parseISO(log.log_date), 'MMM d, yyyy')}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                          {log.projects?.name || 'No Project'}
                        </span>
                        <MoodBadge mood={log.mood} />
                        {log.admin_feedback && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase">
                            <MessageSquare size={10} /> Admin Reply
                          </span>
                        )}
                        {log.blockers?.trim() && (
                          <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase">
                            Blocked
                          </span>
                        )}
                      </div>
                      {/* Task preview */}
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {log.tasks_completed || 'No description.'}
                      </p>
                    </div>

                    {/* Right side: stats + chevron */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xs font-bold text-indigo-600">{log.hours_worked}h</p>
                        <p className={`text-xs font-bold ${
                          log.productivity_score >= 7 ? 'text-green-600' :
                          log.productivity_score >= 4 ? 'text-amber-600' : 'text-red-600'
                        }`}>{log.productivity_score}/10</p>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-gray-300" />
                        : <ChevronDown className="w-4 h-4 text-gray-300" />
                      }
                    </div>
                  </div>
                </button>

                {/* ── Expanded detail ── */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3">
                    {/* Full tasks */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                      <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1.5">
                        Tasks Completed
                      </p>
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {log.tasks_completed || 'No description.'}
                      </p>
                    </div>

                    {/* Blockers */}
                    {log.blockers?.trim() && (
                      <div className="bg-red-50 rounded-xl p-3 border border-red-100">
                        <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1.5">Blockers</p>
                        <p className="text-sm text-red-800">{log.blockers}</p>
                      </div>
                    )}

                    {/* Admin Follow-up */}
                    {log.admin_feedback ? (
                      <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100 flex gap-2.5">
                        <MessageSquare size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest mb-1">Admin Follow-up</p>
                          <p className="text-sm font-semibold text-indigo-900 whitespace-pre-wrap">{log.admin_feedback}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-300 uppercase font-bold tracking-widest text-center py-1">
                        No admin feedback yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
