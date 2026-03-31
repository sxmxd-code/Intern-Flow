import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [role, setRole]     = useState(null)
  const [status, setStatus] = useState(null) // 'pending' | 'approved' | 'rejected'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setRole(null)
        setStatus(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, status, email')
        .eq('id', userId)
        .single()

      if (error) throw error

      // If status is null/empty (column might not be populated), treat as pending
      const fetchedStatus = data?.status || 'pending'
      const fetchedRole   = data?.role   || 'intern'

      setRole(fetchedRole)
      setStatus(fetchedStatus)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setRole('intern')
      setStatus('pending')
    } finally {
      setLoading(false)
    }
  }

  // Call this to manually re-check role/status (used by PendingApproval page)
  const refreshProfile = () => {
    if (user?.id) fetchProfile(user.id)
  }

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()

  return (
    <AuthContext.Provider value={{ user, role, status, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
