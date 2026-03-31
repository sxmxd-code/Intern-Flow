import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { useProductivityScore } from '../../hooks/useProductivityScore'
import { calculateScore } from '../../utils/calculateScore'
import { format } from 'date-fns'
import PageHeader from '../../components/layout/PageHeader'
import GlassCard from '../../components/ui/GlassCard'
import ScoreBar from '../../components/ui/ScoreBar'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function LogToday() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  const [existingLog, setExistingLog] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  
  const [projects, setProjects] = useState([])
  
  const [formData, setFormData] = useState({
    project_id: '',
    tasks_completed: '',
    hours_worked: 4.0,
    blockers: '',
    mood: 'good'
  })

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const todayStr = format(new Date(), 'yyyy-MM-dd')

        // Fetch assigned projects
        const { data: assignments, error: projError } = await supabase
          .from('project_assignments')
          .select('project_id, projects(name)')
          .eq('intern_id', user.id)

        if (projError) throw projError
        setProjects(assignments || [])

        // If projects exist, select first one by default
        if (assignments && assignments.length > 0) {
          setFormData(prev => ({ ...prev, project_id: assignments[0].project_id }))
        }

        // Fetch today's log
        const { data: log, error: logError } = await supabase
          .from('daily_logs')
          .select('*, projects(name)')
          .eq('intern_id', user.id)
          .eq('log_date', todayStr)
          .single()

        if (log && !logError) {
          setExistingLog(log)
          setFormData({
            project_id: log.project_id || '',
            tasks_completed: log.tasks_completed,
            hours_worked: log.hours_worked,
            blockers: log.blockers || '',
            mood: log.mood
          })
        }
      } catch (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is no rows, normal for missing log
          console.error('Error fetching data:', error)
          toast.error('Failed to load data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const previewScore = useProductivityScore(formData.hours_worked, formData.mood)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const todayStr = format(new Date(), 'yyyy-MM-dd')
      const score = calculateScore(formData.hours_worked, formData.mood)

      const payload = {
        intern_id: user.id,
        project_id: formData.project_id || null, // Optional if no projects assigned
        log_date: todayStr,
        tasks_completed: formData.tasks_completed,
        hours_worked: formData.hours_worked,
        blockers: formData.blockers,
        mood: formData.mood,
        productivity_score: score
      }

      if (existingLog) {
        // Update
        const { error } = await supabase
          .from('daily_logs')
          .update(payload)
          .eq('id', existingLog.id)

        if (error) throw error
        toast.success("Log updated successfully!")
      } else {
        // Insert
        const { error } = await supabase
          .from('daily_logs')
          .insert([payload])

        if (error) throw error
        toast.success("Log submitted successfully!")
      }

      navigate('/dashboard')
    } catch (error) {
      toast.error(error.message || "Failed to submit log")
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const moodOptions = [
    { value: 'great', emoji: '😄', label: 'Great' },
    { value: 'good', emoji: '🙂', label: 'Good' },
    { value: 'okay', emoji: '😐', label: 'Okay' },
    { value: 'struggling', emoji: '😟', label: 'Struggling' },
  ]

  if (existingLog && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-10">
        <PageHeader title="Log Today" description={format(new Date(), 'EEEE, MMMM d, yyyy')} />
        
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <p className="font-semibold text-sm">Already logged today</p>
          </div>
          <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-white text-green-700 font-medium rounded-xl hover:bg-green-100 transition-colors text-sm flex-shrink-0">
            Edit
          </button>
        </div>

        <GlassCard className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Project</p>
              <p className="text-gray-900 font-semibold text-sm">{existingLog.projects?.name || 'Unassigned'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Score</p>
              <p className="text-indigo-600 font-bold text-lg">{existingLog.productivity_score}/10</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Tasks Completed</p>
            <div className="bg-gray-50 p-3 rounded-xl text-sm text-gray-800 whitespace-pre-wrap border border-gray-100">{existingLog.tasks_completed}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Hours Worked</p>
              <p className="text-gray-900 font-semibold">{existingLog.hours_worked}h</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Mood</p>
              <p className="font-medium text-gray-900 capitalize">{moodOptions.find(m => m.value === existingLog.mood)?.emoji} {existingLog.mood}</p>
            </div>
          </div>
          {existingLog.blockers && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Blockers</p>
              <div className="bg-red-50 text-red-800 p-3 rounded-xl text-sm whitespace-pre-wrap border border-red-100">{existingLog.blockers}</div>
            </div>
          )}
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-10">
      <PageHeader
        title={isEditing ? "Edit Today's Log" : 'Log Today'}
        description={format(new Date(), 'EEEE, MMMM d, yyyy')}
      />

      <GlassCard hoverLift={false}>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Project */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Project</label>
            <select
              value={formData.project_id}
              onChange={e => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
            >
              <option value="">No Project</option>
              {projects.map(p => <option key={p.project_id} value={p.project_id}>{p.projects?.name}</option>)}
            </select>
          </div>

          {/* Tasks */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Tasks Completed *</label>
            <textarea
              required
              rows={5}
              value={formData.tasks_completed}
              onChange={e => setFormData({ ...formData, tasks_completed: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-400 outline-none resize-none"
              placeholder="What did you accomplish today?"
            />
          </div>

          {/* Hours slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Hours Worked</label>
              <span className="text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full">{formData.hours_worked}h</span>
            </div>
            <input
              type="range" min="0.5" max="12" step="0.5"
              value={formData.hours_worked}
              onChange={e => setFormData({ ...formData, hours_worked: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>0.5h</span><span>12h</span>
            </div>
          </div>

          {/* Blockers */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Blockers <span className="font-normal normal-case text-gray-400">(optional)</span></label>
            <textarea
              rows={2}
              value={formData.blockers}
              onChange={e => setFormData({ ...formData, blockers: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-red-300 outline-none resize-none"
              placeholder="Any blockers or issues?"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Today's Mood</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {moodOptions.map(({ value, emoji, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: value })}
                  className={`flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all ${
                    formData.mood === value
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-1">{emoji}</span>
                  <span className={`text-xs font-semibold ${formData.mood === value ? 'text-indigo-700' : 'text-gray-500'}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Score preview */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <ScoreBar score={previewScore} />
            <p className="text-[10px] text-gray-400 mt-2 text-center">Score based on hours worked and mood</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {isEditing && (
              <button type="button" onClick={() => setIsEditing(false)} disabled={submitting}
                className="flex-1 py-3 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm">
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-60 text-sm"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Log' : 'Submit Log'}
            </button>
          </div>
        </form>
      </GlassCard>
    </div>
  )
}
