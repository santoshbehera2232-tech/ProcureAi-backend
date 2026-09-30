import React, { useState, useEffect } from 'react';
import { Bell, Search, User, LogOut, CheckCircle, AlertTriangle, ChevronDown, Building2, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { api } from '../../services/api.js';

export const Navbar = () => {
  const { user, organization, logout, quickSwitchUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter(n => !n.is_read).length);
      }
    } catch (e) {
      console.warn('Could not load notifications');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 flex items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search RFQs, POs, suppliers, invoices (Ctrl + K)..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-lg pl-10 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Persona quick-switch for evaluation */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/70 border border-slate-700/80 rounded-lg px-3 py-1 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Demo Persona:</span>
          <select
            className="bg-transparent text-brand-400 font-medium focus:outline-none cursor-pointer"
            value={user?.role}
            onChange={(e) => quickSwitchUser(e.target.value)}
          >
            <option value="Admin" className="bg-slate-900 text-white">Company Admin (Vikram)</option>
            <option value="Procurement Manager" className="bg-slate-900 text-white">Procurement Manager (Priya)</option>
            <option value="Finance Manager" className="bg-slate-900 text-white">Finance Manager (Anita)</option>
            <option value="Warehouse Manager" className="bg-slate-900 text-white">Warehouse Manager (Karan)</option>
            <option value="Supplier Admin (Titan Alloys)" className="bg-slate-900 text-white">Supplier Portal (Titan Alloys)</option>
          </select>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-900 animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-850">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-brand-500/20 text-brand-400 px-2 py-0.5 rounded-full font-medium">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} className="text-xs text-brand-400 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className={`p-3.5 transition-colors hover:bg-slate-800/50 ${!n.is_read ? 'bg-brand-950/20' : ''}`}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-200">{n.title}</p>
                        <span className="text-[10px] text-slate-500">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/70 border border-transparent hover:border-slate-700/80 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-brand-500/20">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-200">{user?.full_name || 'Procurement User'}</p>
              <p className="text-[10px] text-brand-400 font-medium">{user?.role || 'Company Admin'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800 mb-1">
                <p className="text-xs font-medium text-white">{user?.full_name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Building2 className="w-3 h-3 text-slate-500" />
                  <span className="truncate">{organization?.name || 'Apex Global Corp'}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
