import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import GlassCard from '../components/ui/GlassCard'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function Login() {
  const { signIn, user, role } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && role) {
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'intern') navigate('/dashboard', { replace: true })
    }
  }, [user, role, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) throw error

      toast.success('Login successful!')
      // Redirection handled by useEffect above
    } catch (error) {
      toast.error(error.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="absolute top-6 left-6">
        <Link to="/"><Logo size="sm" /></Link>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <GlassCard className="p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold font-heading text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-gray-200 bg-white/50 focus:bg-white p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-gray-200 bg-white/50 focus:bg-white p-3 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium text-gray-600">
            Don't have an intern account?{' '}
            <Link to="/signup" className="text-primary-600 hover:text-primary-800 transition-colors">
              Sign up
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
