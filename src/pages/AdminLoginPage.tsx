import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminLoginPageProps {
  onNavigate: (route: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Strictly require admin role verification
      const res = await login(email, password, 'admin');
      if (res.success) {
        onNavigate('/admin/dashboard');
      } else {
        setErrorMsg(res.error || 'Authentication rejected. Administrator privileges required.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected authorization error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#29242A]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-neutral-200 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#29242A] text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldCheck className="w-7 h-7 text-[#E84F87]" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#721C46] bg-[#FFF0F5] px-2.5 py-0.5 rounded-full border border-[#E84F87]/20">
              Restricted Operations Area
            </span>
            <h1 className="font-heading font-extrabold text-2xl text-[#29242A] mt-1.5">
              Admin Portal Sign-In
            </h1>
            <p className="text-xs text-[#756D77] mt-0.5">
              Authorized store managers and fleet administrators only
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1.5">
              Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#756D77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@dewandgo.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#EFE7E1] bg-white text-[#29242A] placeholder-[#9E97A0] focus:outline-none focus:border-[#721C46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1.5">
              Security Key / Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#756D77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-[#EFE7E1] bg-white text-[#29242A] placeholder-[#9E97A0] focus:outline-none focus:border-[#721C46]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756D77] hover:text-[#29242A]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full dew-btn-berry !py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isLoading ? <span>Verifying Privileges...</span> : <span>Access Admin Console</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-xs text-[#756D77] space-y-3">
          <p className="text-[11px] leading-relaxed">
            All administrative access attempts are audited with IP address, timestamp, and security role verification.
          </p>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
            <button
              onClick={() => onNavigate('/')}
              className="text-[#756D77] hover:text-[#721C46] hover:underline font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer Storefront</span>
            </button>
            <button
              onClick={() => onNavigate('/login')}
              className="text-[#756D77] hover:text-[#721C46] hover:underline font-semibold"
            >
              Customer Sign In
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
