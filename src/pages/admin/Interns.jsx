import React, { useState, useEffect } from 'react'
import { Search, ChevronDown, ChevronUp, MessageSquare, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { format, parseISO, differenceInCalendarDays, startOfDay, subDays } from 'date-fns'
import PageHeader from '../../components/layout/PageHeader'
import GlassCard from '../../components/ui/GlassCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import MoodBadge from '../../components/ui/MoodBadge'
import toast from 'react-hot-toast'

export default function AdminInterns() {
  const { role } = useAuth()
  const canDelete = ['admin', 'dept_head'].includes(role)

  const [interns, setInterns]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [expandedRow, setExpandedRow] = useState(null)

  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState(null)   // intern object
  const [deleting, setDeleting]         = useState(false)

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
          const dates  = internLogs.map(d => startOfDay(parseISO(d.log_date)))
          const today  = startOfDay(new Date())
          const latest = dates[0]
          if (latest.getTime() === today.getTime() || latest.getTime() === subDays(today, 1).getTime()) {
            streak = 1
            let check = latest
            for (let i = 1; i < dates.length; i++) {
              const diff = differenceInCalendarDays(check, dates[i])
              if (diff === 1)      { streak++; check = dates[i] }
              else if (diff === 0)  continue
              else                  break
            }
          }
        }
        const avgScore   = internLogs.length > 0
          ? (internLogs.reduce((a, l) => a + Number(l.productivity_score), 0) / internLogs.length).toFixed(1) : 0
        const lastLogDate = internLogs[0]?.log_date || null
        const isActive    = lastLogDate && differenceInCalendarDays(new Date(), parseISO(lastLogDate)) <= 7
        return { ...intern, streak, avgScore, lastLogDate, recentLogs: internLogs.slice(0, 5), isActive }
      })
      setInterns(processedInterns)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // ── Hard delete — wipes all logs then the user row permanently ──
  // Requires these DELETE RLS policies in Supabase:
  //   CREATE POLICY "Admins can delete users" ON users FOR DELETE USING (get_my_role() IN ('admin','dept_head'));
  //   CREATE POLICY "Admins can delete logs"  ON daily_logs FOR DELETE USING (get_my_role() IN ('admin','dept_head'));
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      // Step 1 — delete all their logs
      const { error: logsErr } = await supabase
        .from('daily_logs')
        .delete()
        .eq('intern_id', deleteTarget.id)
      if (logsErr) throw logsErr

      // Step 2 — delete the user row; .select() lets us detect silent RLS blocks
      const { data: deleted, error: userErr } = await supabase
        .from('users')
        .delete()
        .eq('id', deleteTarget.id)
        .select()
      if (userErr) throw userErr

      if (!deleted || deleted.length === 0) {
        throw new Error(
          'Delete blocked by database policy.\n' +
          'Run this in Supabase SQL Editor:\n' +
          'CREATE POLICY "Admins can delete users" ON users FOR DELETE USING (get_my_role() IN (\'admin\',\'dept_head\'));'
        )
      }

      toast.success(`${deleteTarget.full_name} has been permanently removed.`)
      setInterns(prev => prev.filter(i => i.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err) {
      console.error(err)
      toast.error(err.message || 'Delete failed.')
    } finally {
      setDeleting(false)
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
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-gray-800 outline-none"
        />
      </div>

      {/* Intern cards */}
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
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setExpandedRow(isExpanded ? null : intern.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {intern.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-bold text-gray-900 text-sm truncate">{intern.full_name}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${intern.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {intern.isActive ? 'Active' : 'Inactive'}
                          </span>
                          {intern.streak > 0 && (
                            <span className="text-orange-500 text-xs font-bold">🔥{intern.streak}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">{intern.email}</p>
                      </div>
                    </div>
                    {/* Stats row */}
                    <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                      <span>Avg: <strong className="text-gray-900">{intern.avgScore}/10</strong></span>
                      <span>Last: <strong className="text-gray-700">{intern.lastLogDate ? format(parseISO(intern.lastLogDate), 'MMM d') : 'Never'}</strong></span>
                      <span>Logs: <strong className="text-gray-700">{intern.recentLogs.length}+</strong></span>
                    </div>
                  </button>

                  {/* Right actions */}
                  <div className="flex items-start gap-1.5 flex-shrink-0 pt-1">
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(intern)}
                        className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete account"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedRow(isExpanded ? null : intern.id)}
                      className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  </div>
                </div>

                {/* Expanded log details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-widest">Recent Logs</h4>
                    {intern.recentLogs.length === 0 ? (
                      <p className="text-sm text-gray-400">No logs yet.</p>
                    ) : (
                      intern.recentLogs.map(log => (
                        <div key={log.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800">
                              {format(parseISO(log.log_date), 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-gray-500">{log.hours_worked}h worked</span>
                            <span className="text-xs text-gray-900 font-bold">Score: {log.productivity_score}</span>
                            <MoodBadge mood={log.mood} />
                            {log.blockers?.trim() && (
                              <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded text-[10px] font-bold uppercase">Blocked</span>
                            )}
                          </div>

                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Tasks</p>
                            <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                              {log.tasks_completed || <span className="text-gray-400 italic">No description.</span>}
                            </p>
                          </div>

                          {log.blockers?.trim() && (
                            <div className="bg-red-50 rounded-lg p-2.5 border border-red-100">
                              <p className="text-[10px] font-black uppercase text-red-500 tracking-widest mb-1">Blockers</p>
                              <p className="text-xs text-red-800 whitespace-pre-wrap">{log.blockers}</p>
                            </div>
                          )}

                          {log.admin_feedback && (
                            <div className="bg-gray-100 rounded-lg p-2.5 border border-gray-200 flex gap-2">
                              <MessageSquare size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-0.5">Admin Note</p>
                                <p className="text-xs text-gray-900 font-semibold whitespace-pre-wrap">{log.admin_feedback}</p>
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

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900 text-center mb-1">Delete Account?</h3>
            <p className="text-sm text-gray-500 text-center mb-1">
              You're about to permanently delete
            </p>
            <p className="text-sm font-bold text-gray-900 text-center mb-1">{deleteTarget.full_name}</p>
            <p className="text-xs text-gray-400 text-center mb-5">
              ({deleteTarget.email})
            </p>
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5 text-xs text-red-700">
              ⚠️ This will permanently delete their account and all their log history. This cannot be undone.
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
