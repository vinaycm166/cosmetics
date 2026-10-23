import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
  redirectUrl?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, redirectUrl = '/account' }) => {
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
      const res = await login(email, password, 'customer');
      if (res.success) {
        if (res.user?.role && ['super_admin', 'store_manager', 'order_manager'].includes(res.user.role)) {
          onNavigate('/admin/dashboard');
        } else {
          onNavigate(redirectUrl || '/account');
        }
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F4]">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-[#EFE7E1] shadow-card">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FFF0F5] border border-[#E84F87]/20 flex items-center justify-center mx-auto text-[#721C46]">
            <UserCheck className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#29242A]">
            Sign in to Dew & Go
          </h1>
          <p className="text-xs text-[#756D77]">
            Access your orders, saved addresses, and express quick-commerce beauty delivery
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#756D77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#EFE7E1] bg-white text-[#29242A] placeholder-[#9E97A0] focus:outline-none focus:border-[#721C46]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('/forgot-password')}
                className="text-xs font-semibold text-[#721C46] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
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
            {isLoading ? <span>Signing in...</span> : <span>Sign In</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 text-center text-xs text-[#756D77] space-y-3">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate(redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup')}
              className="font-bold text-[#721C46] hover:underline"
            >
              Create Account
            </button>
          </p>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 text-[#267653]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>256-bit Secure TLS</span>
            </span>
            <button
              onClick={() => onNavigate('/admin/login')}
              className="text-[#756D77] hover:text-[#721C46] hover:underline font-semibold"
            >
              Admin Portal →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
