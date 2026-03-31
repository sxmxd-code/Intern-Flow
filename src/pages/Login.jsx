import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function Login() {
  const { signIn, user, role, status } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [noProfile, setNoProfile] = useState(false) // auth exists but no users row

  useEffect(() => {
    if (!user && status === 'no_profile') {
      // User was signed out by AuthContext — no users row found
      setNoProfile(true)
      return
    }
    if (!user || !role || !status) return
    if (status === 'pending' || status === 'rejected') navigate('/pending', { replace: true })
    else if (['admin', 'staff', 'dept_head'].includes(role)) navigate('/admin', { replace: true })
    else navigate('/dashboard', { replace: true })
  }, [user, role, status])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setNoProfile(false)
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) throw error
    } catch (err) {
      toast.error(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Logo bar */}
      <div className="px-6 py-5 flex-shrink-0">
        <Link to="/"><Logo size="sm" /></Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-10">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 p-8">

            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl font-black text-gray-900 mb-1">Welcome Back</h2>
              <p className="text-gray-400 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-gray-800 outline-none transition-colors"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-gray-800 outline-none transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors disabled:opacity-60 mt-2"
              >
                {loading
                  ? <Loader2 className="animate-spin h-5 w-5" />
                  : <> Sign In <ArrowRight className="ml-2 h-4 w-4" /> </>
                }
              </button>
            </form>

            {/* No profile — show signup prompt */}
            {noProfile && (
              <div className="mt-4 flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-amber-800">No account found</p>
                  <p className="text-amber-700 text-xs mt-0.5">
                    This email isn't registered yet.{' '}
                    <Link to="/signup" className="font-bold underline">Sign up here</Link>{' '}
                    to request access.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-gray-900 font-bold hover:underline">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
