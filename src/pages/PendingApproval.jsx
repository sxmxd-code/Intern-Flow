import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, LogOut, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/ui/Logo'

export default function PendingApproval() {
  const { user, role, status, signOut, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => { refreshProfile() }, 4000)
    return () => clearInterval(intervalRef.current)
  }, [])

  useEffect(() => {
    if (status === 'approved' && role && role !== 'pending') {
      clearInterval(intervalRef.current)
      const adminRoles = ['admin', 'staff', 'dept_head']
      navigate(adminRoles.includes(role) ? '/admin' : '/dashboard', { replace: true })
    }
  }, [status, role])

  const isRejected = status === 'rejected'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in text-center">
        <div className="bg-white rounded-2xl border border-gray-200 p-10">
          <div className="mb-8 flex justify-center">
            <Logo size="sm" />
          </div>

          {isRejected ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <span className="text-2xl">❌</span>
              </div>
              <h1 className="text-xl font-black text-gray-900 mb-2">Request Rejected</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Your access request was not approved. Contact your administrator for more info.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5 relative">
                <Clock className="w-8 h-8 text-gray-700" />
                <span className="absolute inset-0 rounded-2xl border-2 border-gray-400 animate-ping opacity-20" />
              </div>
              <h1 className="text-xl font-black text-gray-900 mb-2">Awaiting Approval</h1>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Your account is pending admin review. You'll get access as soon as your role is approved.
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-5">
                <Loader2 size={12} className="animate-spin" />
                Checking automatically…
              </div>
            </>
          )}

          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-5 text-left">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Signed in as</p>
            <p className="text-sm font-bold text-gray-800 truncate">{user?.email}</p>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-5">
          Contact your administrator if this takes too long.
        </p>
      </div>
    </div>
  )
}
