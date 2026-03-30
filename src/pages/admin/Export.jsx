import React, { useState, useEffect } from 'react'
import { Download, Filter, RefreshCw, Eye } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'
import { exportToCSV } from '../../utils/exportCSV'
import PageHeader from '../../components/layout/PageHeader'
import GlassCard from '../../components/ui/GlassCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import MoodBadge from '../../components/ui/MoodBadge'

export default function ExportLogs() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [previewData, setPreviewData] = useState([])
  
  // Filter dropdowns
  const [interns, setInterns] = useState([])
  const [projects, setProjects] = useState([])

  // Filter state
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedIntern, setSelectedIntern] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedMoods, setSelectedMoods] = useState([])

  useEffect(() => {
    fetchOptions()
  }, [])

  const fetchOptions = async () => {
    try {
      const { data: iData } = await supabase.from('users').select('id, full_name, email').eq('role', 'intern').order('full_name')
      const { data: pData } = await supabase.from('projects').select('id, name').order('name')
      
      setInterns(iData || [])
      setProjects(pData || [])
    } catch (error) {
      console.error('Error fetching options:', error)
    }
  }

  const toggleMood = (mood) => {
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood))
    } else {
      setSelectedMoods([...selectedMoods, mood])
    }
  }

  const handlePreview = async () => {
    setLoading(true)
    try {
      // Build query
      let query = supabase
        .from('daily_logs')
        .select(`*, users (full_name, email), projects (name)`)
        .order('log_date', { ascending: false })

      if (startDate) query = query.gte('log_date', startDate)
      if (endDate) query = query.lte('log_date', endDate)
      if (selectedIntern) query = query.eq('intern_id', selectedIntern)
      if (selectedProject) query = query.eq('project_id', selectedProject)
      if (selectedMoods.length > 0) query = query.in('mood', selectedMoods)

      const { data: logs, error } = await query

      if (error) throw error

      const formatted = logs.map(log => ({
        intern_name: log.users?.full_name || 'Unknown',
        email: log.users?.email || '',
        project_name: log.projects?.name || 'Unassigned',
        log_date: log.log_date,
        tasks_completed: log.tasks_completed,
        hours_worked: log.hours_worked,
        mood: log.mood,
        productivity_score: log.productivity_score,
        blockers: log.blockers || ''
      }))

      setData(formatted)
      setPreviewData(formatted.slice(0, 10)) // max 10 for preview
    } catch (error) {
      console.error('Error fetching preview data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (data.length > 0) {
      exportToCSV(data)
    }
  }

  const handleExportAll = async () => {
    setLoading(true)
    try {
      const { data: logs, error } = await supabase
        .from('daily_logs')
        .select(`*, users (full_name, email), projects (name)`)
        .order('log_date', { ascending: false })

      if (error) throw error

      const formatted = logs.map(log => ({
        intern_name: log.users?.full_name || 'Unknown',
        email: log.users?.email || '',
        project_name: log.projects?.name || 'Unassigned',
        log_date: log.log_date,
        tasks_completed: log.tasks_completed,
        hours_worked: log.hours_worked,
        mood: log.mood,
        productivity_score: log.productivity_score,
        blockers: log.blockers || ''
      }))

      exportToCSV(formatted, 'internflow_export_all')
    } catch (error) {
      console.error('Error exporting all:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-fade-in">
      <PageHeader 
        title="Export Data" 
        description="Filter and export daily logs as CSV" 
      />

      <GlassCard className="p-6 border border-primary-100" hoverLift={false}>
        <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
          <Filter className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-bold font-heading text-gray-900">Custom Export Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Intern</label>
            <select 
              value={selectedIntern}
              onChange={(e) => setSelectedIntern(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Interns</option>
              {interns.map(i => <option key={i.id} value={i.id}>{i.full_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project</label>
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Mood Selection</label>
          <div className="flex flex-wrap gap-3">
            {['great', 'good', 'okay', 'struggling'].map(mood => (
              <button
                key={mood}
                onClick={() => toggleMood(mood)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  selectedMoods.includes(mood)
                    ? 'bg-primary-50 border-primary-300 text-primary-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="capitalize">{mood}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-10 pt-6 border-t border-gray-100 gap-4">
          <button 
            onClick={handleExportAll}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export All Data (No Filters)
          </button>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePreview}
              disabled={loading}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Preview
            </button>
            <button 
              onClick={handleExportCSV}
              disabled={data.length === 0 || loading}
              className="flex-1 sm:flex-none px-8 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 hover:shadow-lg focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV ({data.length})
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Preview Section */}
      <GlassCard className="p-0 overflow-hidden" hoverLift={false}>
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" /> Data Preview
          </h3>
          <span className="text-xs font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full shadow-sm border border-gray-100">
            Showing {previewData.length} of {data.length} results
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3 border-b border-gray-100">Intern</th>
                <th className="px-6 py-3 border-b border-gray-100">Project</th>
                <th className="px-6 py-3 border-b border-gray-100">Date</th>
                <th className="px-6 py-3 border-b border-gray-100 min-w-[200px]">Tasks</th>
                <th className="px-6 py-3 border-b border-gray-100 text-center">Hours</th>
                <th className="px-6 py-3 border-b border-gray-100 text-center">Mood</th>
                <th className="px-6 py-3 border-b border-gray-100 text-center">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white/50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400">
                    Click Preview to see filtered results
                  </td>
                </tr>
              ) : (
                previewData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.intern_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{row.project_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{format(parseISO(row.log_date), 'MMM d, yyyy')}</td>
                    <td className="px-6 py-4 text-gray-600 truncate max-w-[250px]">{row.tasks_completed}</td>
                    <td className="px-6 py-4 text-center font-medium">{row.hours_worked}h</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <MoodBadge mood={row.mood} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-primary-700">{row.productivity_score}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
