import React, { useState, useEffect } from 'react'
import { Briefcase, Users, X, Save, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import PageHeader from '../../components/layout/PageHeader'
import GlassCard from '../../components/ui/GlassCard'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AssignInterns() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [projects, setProjects] = useState([])
  const [interns, setInterns] = useState([])
  
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [assignedInternIds, setAssignedInternIds] = useState(new Set())
  const [originalAssignedIds, setOriginalAssignedIds] = useState(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: pData, error: pError } = await supabase.from('projects').select('id, name').order('name')
      if (pError) throw pError
      
      const { data: iData, error: iError } = await supabase.from('users').select('id, full_name, email').eq('role', 'intern').order('full_name')
      if (iError) throw iError
      
      setProjects(pData || [])
      setInterns(iData || [])
      
      if (pData && pData.length > 0) {
        setSelectedProjectId(pData[0].id)
      }
    } catch (error) {
      console.error('Error fetching assign data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedProjectId) {
      loadAssignmentsForProject(selectedProjectId)
    }
  }, [selectedProjectId])

  const loadAssignmentsForProject = async (projectId) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('project_assignments')
        .select('intern_id')
        .eq('project_id', projectId)
        
      if (error) throw error
      
      const ids = new Set(data.map(a => a.intern_id))
      setAssignedInternIds(ids)
      setOriginalAssignedIds(new Set(ids))
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleIntern = (internId) => {
    const newAssigned = new Set(assignedInternIds)
    if (newAssigned.has(internId)) {
      newAssigned.delete(internId)
    } else {
      newAssigned.add(internId)
    }
    setAssignedInternIds(newAssigned)
  }

  const handleSave = async () => {
    if (!selectedProjectId) return
    
    setSaving(true)
    try {
      const current = Array.from(assignedInternIds)
      const original = Array.from(originalAssignedIds)
      
      const toAdd = current.filter(id => !original.includes(id))
      const toRemove = original.filter(id => !current.includes(id))
      
      if (toRemove.length > 0) {
        const { error: rmError } = await supabase
          .from('project_assignments')
          .delete()
          .eq('project_id', selectedProjectId)
          .in('intern_id', toRemove)
        if (rmError) throw rmError
      }
      
      if (toAdd.length > 0) {
        const insertData = toAdd.map(id => ({
          project_id: selectedProjectId,
          intern_id: id
        }))
        const { error: addError } = await supabase
          .from('project_assignments')
          .insert(insertData)
        if (addError) throw addError
      }
      
      setOriginalAssignedIds(new Set(assignedInternIds))
      toast.success("Assignments saved successfully")
    } catch (error) {
      toast.error(error.message || "Failed to save assignments")
    } finally {
      setSaving(false)
    }
  }

  const hasChanges = () => {
    if (assignedInternIds.size !== originalAssignedIds.size) return true
    for (let id of assignedInternIds) {
      if (!originalAssignedIds.has(id)) return true
    }
    return false
  }

  if (loading && projects.length === 0) return <LoadingSpinner />

  const assignedInternsList = interns.filter(i => assignedInternIds.has(i.id))

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-fade-in">
      <PageHeader 
        title="Assign Interns" 
        description="Manage which interns are working on which projects" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Checklist */}
        <GlassCard className="flex flex-col h-full border border-gray-200">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Project</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="pl-10 w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 font-medium outline-none shadow-sm"
              >
                {projects.length === 0 ? (
                  <option value="">No projects available</option>
                ) : (
                  projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="flex-1 min-h-[400px]">
             <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
               <Users className="w-4 h-4 text-primary-600" /> Select Interns ({assignedInternIds.size} selected)
             </h3>
             <div className="space-y-2 pr-2 custom-scrollbar">
               {interns.length === 0 ? (
                 <p className="text-sm text-gray-500 italic p-4">No interns found.</p>
               ) : (
                 interns.map(intern => {
                   const isChecked = assignedInternIds.has(intern.id)
                   return (
                     <label 
                       key={intern.id} 
                       className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                         isChecked 
                           ? 'bg-primary-50/50 border-primary-200 shadow-sm' 
                           : 'bg-white/50 border-transparent hover:bg-gray-50'
                       }`}
                     >
                       <div className="relative flex items-center justify-center w-5 h-5">
                         <input
                           type="checkbox"
                           className="w-5 h-5 border-2 border-gray-300 rounded text-primary-600 focus:ring-primary-500 transition-colors cursor-pointer appearance-none checked:bg-primary-600 checked:border-primary-600"
                           checked={isChecked}
                           onChange={() => handleToggleIntern(intern.id)}
                         />
                         {isChecked && <CheckCircle className="w-3.5 h-3.5 text-white absolute pointer-events-none" />}
                       </div>
                       <div>
                         <span className="block font-semibold text-gray-900 text-sm leading-tight">{intern.full_name}</span>
                         <span className="block text-xs text-gray-500 mt-0.5">{intern.email}</span>
                       </div>
                     </label>
                   )
                 })
               )}
             </div>
          </div>
        </GlassCard>

        {/* Right Panel: Selected Items */}
        <div className="space-y-6 flex flex-col h-full">
          <GlassCard className="flex-1 flex flex-col border border-primary-100 bg-primary-50/30">
            <h3 className="text-lg font-bold font-heading text-primary-900 mb-4 flex items-center justify-between border-b border-primary-100 pb-3">
              <span>Currently Assigned</span>
              <span className="text-sm font-medium bg-white px-2.5 py-1 rounded-full text-primary-700 shadow-sm">
                {assignedInternsList.length} Interns
              </span>
            </h3>
            
            <div className="flex-1">
              {assignedInternsList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 text-primary-300" />
                  </div>
                  <p className="text-primary-800 font-medium">Nobody is assigned to this project yet.</p>
                  <p className="text-sm text-primary-600/70 mt-1 max-w-[250px]">Select interns from the list on the left to assign them.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {assignedInternsList.map(intern => (
                    <div 
                      key={intern.id} 
                      className="flex items-center gap-2 bg-white border border-primary-200 px-3 py-2 rounded-xl text-sm font-semibold text-primary-900 shadow-sm animate-fade-in"
                    >
                      {intern.full_name}
                      <button 
                        onClick={() => handleToggleIntern(intern.id)}
                        className="text-primary-400 hover:text-red-500 hover:bg-red-50 p-0.5 rounded-full transition-colors focus:outline-none"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-primary-100 flex items-center justify-between">
               <div className="text-sm font-medium text-primary-700">
                 {hasChanges() ? 'Unsaved changes pending' : 'All changes saved'}
               </div>
               <button
                 onClick={handleSave}
                 disabled={saving || !hasChanges() || !selectedProjectId}
                 className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 hover:shadow-lg focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-50 disabled:hover:shadow-none flex items-center gap-2"
               >
                 {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Assignments</>}
               </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}
