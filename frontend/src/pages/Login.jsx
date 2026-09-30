import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Boxes, ShieldCheck, ArrowRight, Lock, Mail, Building, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSupplier, setIsSupplier] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, quickSwitchUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, isSupplier);
      navigate(isSupplier ? '/supplier-portal' : '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (roleName) => {
    setError('');
    setLoading(true);
    try {
      await quickSwitchUser(roleName);
      if (roleName.includes('Supplier')) {
        navigate('/supplier-portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-xl shadow-brand-500/30 mb-3">
            <Boxes className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">PROCURE<span className="text-brand-400">AI</span></h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise AI-Powered Procurement & Supplier Management</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Tabs for Portal Mode */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl mb-6 border border-slate-800">
            <button
              type="button"
              onClick={() => { setIsSupplier(false); setEmail(''); setPassword(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                !isSupplier ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Enterprise Portal
            </button>
            <button
              type="button"
              onClick={() => { setIsSupplier(true); setEmail(''); setPassword(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                isSupplier ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Supplier Portal
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                {isSupplier ? 'Supplier Account Email' : 'Work Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isSupplier ? 'supplier1@titanalloys.com' : 'admin@apexglobal.com'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <span className="text-[11px] text-brand-400 cursor-pointer hover:underline">Forgot password?</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In Securely'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant 1-Click Evaluation Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemo('Admin')}
                className="p-2 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-slate-300 border border-slate-700/60 text-left transition-colors truncate"
              >
                🏢 Company Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Procurement Manager')}
                className="p-2 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-slate-300 border border-slate-700/60 text-left transition-colors truncate"
              >
                📋 Procurement Mgr
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Finance Manager')}
                className="p-2 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-slate-300 border border-slate-700/60 text-left transition-colors truncate"
              >
                💳 Finance Manager
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Supplier Admin (Titan Alloys)')}
                className="p-2 bg-indigo-950/60 hover:bg-indigo-900/60 rounded-lg text-indigo-300 border border-indigo-800/60 text-left transition-colors truncate"
              >
                🚚 Supplier (Titan)
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            New organization?{' '}
            <Link to="/register" className="text-brand-400 font-semibold hover:underline">
              Register New Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
