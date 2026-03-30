import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Sidebar from './components/layout/Sidebar'

// Pages Placeholder (will replace imports with real files once created)
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'

// Intern Pages
import Dashboard from './pages/intern/Dashboard'
import LogToday from './pages/intern/LogToday'
import MyLogs from './pages/intern/MyLogs'
import MyProjects from './pages/intern/MyProjects'
import InternProfile from './pages/intern/Profile'

// Admin Pages
import AdminOverview from './pages/admin/Overview'
import AdminInterns from './pages/admin/Interns'
import AdminProjects from './pages/admin/Projects'
import AssignInterns from './pages/admin/Assign'
import ExportLogs from './pages/admin/Export'
import AdminProfile from './pages/admin/Profile'

function Layout() {
  return (
    <div className="flex flex-col md:flex-row h-screen bg-white relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none -z-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>
      <div className="absolute -bottom-32 left-80 w-96 h-96 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none -z-10"></div>
      
      <Sidebar />
      <div className="flex-1 overflow-auto p-4 md:p-8 animate-fade-in z-0 relative">
        <Outlet />
      </div>
    </div>
  )
}

function MainLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      {/* Background blobs for auth/landing pages */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-300/20 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full mix-blend-multiply filter blur-[120px] animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[150px] animate-blob" style={{ animationDelay: '4s' }}></div>
      </div>
      <Outlet />
    </div>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Intern Routes */}
          <Route element={<ProtectedRoute allowedRoles={['intern']} />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/log" element={<LogToday />} />
              <Route path="/my-logs" element={<MyLogs />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/profile" element={<InternProfile />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/interns" element={<AdminInterns />} />
              <Route path="/admin/projects" element={<AdminProjects />} />
              <Route path="/admin/assign" element={<AssignInterns />} />
              <Route path="/admin/export" element={<ExportLogs />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>
          </Route>
        </Routes>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: '#333',
              boxShadow: '0 8px 32px rgba(31,38,135,0.08)'
            }
          }}
        />
      </AuthProvider>
    </Router>
  )
}
