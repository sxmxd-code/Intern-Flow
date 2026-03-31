import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function Login() {
  const { signIn, user, role, status } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  // Redirect once role + status are loaded
  useEffect(() => {
    if (!user || !role || !status) return

    if (status === 'pending' || status === 'rejected') {
      navigate('/pending', { replace: true })
    } else if (['admin', 'staff', 'dept_head'].includes(role)) {
      navigate('/admin', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }, [user, role, status])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) throw error
      // redirect handled by useEffect above
    } catch (err) {
      toast.error(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      {/* Logo top-left */}
      <div className="absolute top-6 left-6">
        <Link to="/"><Logo size="sm" /></Link>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-1">Welcome Back</h2>
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
                  className="pl-10 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-colors"
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
                  className="pl-10 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
            >
              {loading
                ? <Loader2 className="animate-spin h-5 w-5" />
                : <> Sign In <ArrowRight className="ml-2 h-4 w-4" /> </>
              }
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
