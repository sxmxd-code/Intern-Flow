import React, { useState, useEffect } from 'react'
import { Briefcase, Plus, Users, Edit2, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import PageHeader from '../../components/layout/PageHeader'
import GlassCard from '../../components/ui/GlassCard'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminProjects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  
  // Form states
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  
  // Delete states
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // Fetch projects and project_assignments to get count
      // Supabase count syntax: select('*, project_assignments(count)')
      const { data, error } = await supabase
        .from('projects')
        .select(`
          id,
          name,
          description,
          created_at,
          project_assignments!left (
            intern_id
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formatted = data.map(p => ({
        ...p,
        assigneeCount: p.project_assignments ? p.project_assignments.length : 0
      }))

      setProjects(formatted)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (project = null) => {
    if (project) {
      setEditingId(project.id)
      setFormData({ name: project.name, description: project.description || '' })
    } else {
      setEditingId(null)
      setFormData({ name: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setFormData({ name: '', description: '' })
    setEditingId(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSubmitting(true)
    try {
      if (editingId) {
        const { error } = await supabase
          .from('projects')
          .update({ name: formData.name, description: formData.description })
          .eq('id', editingId)
        if (error) throw error
        toast.success("Project updated")
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{ 
            name: formData.name, 
            description: formData.description,
            created_by: user.id
          }])
        if (error) throw error
        toast.success("Project created")
      }
      handleCloseModal()
      fetchProjects()
    } catch (error) {
      toast.error(error.message || "Failed to save project")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingId) return
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', deletingId)

      if (error) throw error
      toast.success("Project deleted")
      
      setIsDeleteModalOpen(false)
      setDeletingId(null)
      fetchProjects()
    } catch (error) {
      toast.error(error.message || "Failed to delete project")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-fade-in">
      <PageHeader 
        title="Manage Projects" 
        description="Create and manage projects assigned to interns" 
      >
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl shadow-md hover:bg-primary-700 hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" /> New Project
        </button>
      </PageHeader>

      {projects.length === 0 ? (
        <EmptyState 
          icon={Briefcase} 
          title="No projects yet" 
          message="Create your first project to start assigning interns." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <GlassCard key={project.id} className="flex flex-col h-full border border-gray-200 group" hoverLift>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(project)}
                    className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => { setDeletingId(project.id); setIsDeleteModalOpen(true) }}
                    className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold font-heading text-gray-900 mb-2 line-clamp-2">{project.name}</h3>
                <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4">{project.description || 'No description provided.'}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100/60 flex items-center text-xs font-semibold text-primary-700 gap-1 bg-primary-50 rounded-lg px-3 py-2 w-max">
                <Users className="w-4 h-4" />
                {project.assigneeCount} intern{project.assigneeCount === 1 ? '' : 's'} assigned
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={editingId ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Project Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
              placeholder="E.g., Authentication Service Refactor"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
              placeholder="What is this project about?"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={submitting}
              className="px-6 py-2.5 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 hover:shadow-lg focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {submitting ? 'Saving...' : 'Save Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => { setIsDeleteModalOpen(false); setDeletingId(null) }}
        title="Delete Project?"
      >
        <div className="space-y-6">
          <p className="text-gray-600 text-sm">
            Are you sure you want to delete this project? This will also remove all assignments for this project. Intern logs associated with this project will be kept but show as unassigned. This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => { setIsDeleteModalOpen(false); setDeletingId(null) }}
              disabled={submitting}
              className="px-6 py-2.5 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={submitting}
              className="px-6 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 hover:shadow-lg transition-colors disabled:opacity-70 flex items-center gap-2"
            >
              {submitting ? 'Deleting...' : 'Yes, Delete Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
