import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home, PencilLine, FileText, Briefcase, User, LogOut,
  LayoutDashboard, Users, FileSpreadsheet, Download, Menu, X, Bell
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import Logo from '../ui/Logo'

export default function Sidebar() {
  const { role, signOut, user } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  const isAdmin   = ['admin', 'staff', 'dept_head'].includes(role)
  const canApprove = ['admin', 'dept_head'].includes(role)

  useEffect(() => {
    if (!canApprove) return
    const fetchPending = async () => {
      const { count } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      setPendingCount(count || 0)
    }
    fetchPending()
    const interval = setInterval(fetchPending, 30000)
    return () => clearInterval(interval)
  }, [canApprove])

  const internLinks = [
    { name: 'Dashboard',   path: '/dashboard',   icon: Home },
    { name: 'Log Today',   path: '/log',         icon: PencilLine },
    { name: 'My Logs',     path: '/my-logs',     icon: FileText },
    { name: 'My Projects', path: '/my-projects', icon: Briefcase },
    { name: 'Profile',     path: '/profile',     icon: User },
  ]

  const adminLinks = [
    { name: 'Overview',  path: '/admin',          icon: LayoutDashboard },
    { name: 'Interns',   path: '/admin/interns',  icon: Users },
    { name: 'Projects',  path: '/admin/projects', icon: Briefcase },
    { name: 'Assign',    path: '/admin/assign',   icon: FileSpreadsheet },
    { name: 'Export',    path: '/admin/export',   icon: Download },
    ...(canApprove ? [{ name: 'Requests', path: '/admin/requests', icon: Bell, badge: pendingCount }] : []),
    { name: 'Profile',   path: '/admin/profile',  icon: User },
  ]

  const links = isAdmin ? adminLinks : internLinks

  const handleLogout = async () => {
    try { await signOut(); toast.success('Logged out') }
    catch { toast.error('Logout failed.') }
  }

  const getInitials = (name, email) => {
    if (name) {
      const parts = name.trim().split(' ')
      return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase()
    }
    return email ? email.substring(0, 2).toUpperCase() : 'U'
  }

  const close = () => setIsOpen(false)

  // Role labels — B&W, no colors, just text
  const roleConfig = {
    admin:     { label: 'Admin' },
    dept_head: { label: 'Dept Head' },
    staff:     { label: 'Staff' },
    intern:    { label: 'Intern' },
  }
  const roleLabel = roleConfig[role]?.label || role

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 flex-shrink-0">
        <Logo size="lg" />
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ name, path, icon: Icon, badge }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={name}
              to={path}
              onClick={close}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} size={18} />
              <span className="flex-1 truncate">{name}</span>
              {/* Pending badge */}
              {badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-2 flex-shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {getInitials(user?.user_metadata?.full_name, user?.email)}
          </div>
          <div className="overflow-hidden flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{roleLabel}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <Menu size={20} />
        </button>
        <Logo size="sm" />
        {canApprove && pendingCount > 0 && (
          <span className="ml-auto bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {pendingCount}
          </span>
        )}
      </div>

      {/* Mobile drawer overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/25"
          onClick={close}
        >
          <div
            className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl animate-slide-in-left"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <Logo size="sm" />
              <button type="button" onClick={close} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="h-[calc(100%-65px)] overflow-y-auto">
              {/* Nav only (no duplicate logo) */}
              <nav className="px-3 py-4 space-y-0.5">
                {links.map(({ name, path, icon: Icon, badge }) => {
                  const isActive = location.pathname === path
                  return (
                    <Link
                      key={name}
                      to={path}
                      onClick={close}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white font-semibold'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} size={18} />
                      <span className="flex-1 truncate">{name}</span>
                      {badge > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>
              <div className="px-4 py-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {getInitials(user?.user_metadata?.full_name, user?.email)}
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{roleLabel}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4 flex-shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>
    </>
  )
}
