import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { User, Mail, Lock, ArrowRight, Loader2, Briefcase, Clock } from 'lucide-react'
import Logo from '../components/ui/Logo'
import { supabase } from '../lib/supabase'

const ROLES = [
  {
    value: 'intern',
    label: 'Intern',
    desc: 'Log daily work, track tasks & projects',
    icon: '🎓',
  },
  {
    value: 'staff',
    label: 'Staff',
    desc: 'Monitor team activity and log reports',
    icon: '👔',
  },
  {
    value: 'dept_head',
    label: 'Department Head',
    desc: 'Full team oversight and analytics',
    icon: '🏢',
  },
]

export default function Signup() {
  const [fullName, setFullName]         = useState('')
  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [selectedRole, setSelectedRole] = useState('intern')
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [showSuccess, setShowSuccess]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setLoading(true)
    try {
      // 1. Create auth user — role starts as 'pending' until admin approves
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })
      if (authError) throw authError

      const userId = authData?.user?.id
      if (!userId) throw new Error('Signup failed — no user ID returned.')

      // 2. Insert/update users row — role='intern' (valid default),
      //    status='pending' blocks access until admin approves,
      //    requested_role stores what they actually want
      const { error: dbError } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email,
          full_name: fullName,
          role: 'intern',            // valid DB value — won't violate check constraint
          requested_role: selectedRole, // what they actually want
          status: 'pending',         // blocks login until admin approves
        })

      if (dbError) throw dbError

      setShowSuccess(true)
    } catch (err) {
      setError(err.message || 'Failed to sign up')
      toast.error(err.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10">
            <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-2">
              Your account has been created and is pending admin approval.
            </p>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-800 font-semibold mb-6">
              Requested role: <span className="capitalize">{selectedRole.replace('_', ' ')}</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              You'll be able to log in once an admin approves your account. Check your email for a verification link first.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <div className="absolute top-6 left-6">
        <Link to="/"><Logo size="sm" /></Link>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-1">
              Join Intern<span className="text-indigo-600">~</span>Flow
            </h2>
            <p className="text-gray-400 text-sm">Request access — admin will approve your role</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  placeholder="John Doe"
                />
              </div>
            </div>

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
                  className="pl-10 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
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
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10 w-full rounded-xl border border-gray-200 p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={`pl-10 w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-indigo-400 outline-none ${
                    error ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                Requested Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-center ${
                      selectedRole === role.value
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <span className="text-xl">{role.icon}</span>
                    <span className={`text-[11px] font-bold leading-tight ${
                      selectedRole === role.value ? 'text-indigo-700' : 'text-gray-600'
                    }`}>
                      {role.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Activated after admin approval
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>Request Access <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
