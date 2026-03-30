import React, { useState, useEffect } from 'react'
import { Briefcase, Calendar } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { format, parseISO } from 'date-fns'
import PageHeader from '../../components/layout/PageHeader'
import GlassCard from '../../components/ui/GlassCard'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function MyProjects() {
  const { user } = useAuth()
  
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return
      
      try {
        const { data, error } = await supabase
          .from('project_assignments')
          .select(`
            assigned_at,
            projects (
              id,
              name,
              description,
              created_at
            )
          `)
          .eq('intern_id', user.id)

        if (error) throw error
        setProjects(data || [])
      } catch (error) {
        console.error('Error fetching projects:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
  }, [user])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-8 animate-fade-in">
      <PageHeader 
        title="My Projects" 
        description="Projects you are currently assigned to" 
      />

      {projects.length === 0 ? (
        <EmptyState 
          icon={Briefcase} 
          title="No projects assigned yet" 
          message="When an admin assigns you to a project, it will appear here." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((assignment) => {
            const project = assignment.projects
            if (!project) return null
            return (
              <GlassCard key={project.id} className="flex flex-col h-full border border-primary-100" hoverLift={true}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 shadow-sm shrink-0">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
                    Assigned
                  </span>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-xl font-bold font-heading text-gray-900 mb-2 line-clamp-2">{project.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-4 leading-relaxed mb-4">{project.description || 'No description provided.'}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100/60 flex items-center text-xs text-gray-500 gap-1 font-medium">
                  <Calendar className="w-3.5 h-3.5" />
                  Assigned on: {format(parseISO(assignment.assigned_at), 'MMM d, yyyy')}
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}
    </div>
  )
}
