import React, { useState } from 'react';
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  onNavigate: (route: string) => void;
  redirectUrl?: string;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate, redirectUrl = '/account' }) => {
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password entry.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signup({
        fullName,
        email,
        password,
        confirmPassword,
        phone
      });

      if (res.success) {
        onNavigate(redirectUrl || '/account');
      } else {
        setErrorMsg(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F4]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-[#EFE7E1] shadow-card">
        
        {/* Header */}
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#721C46] bg-[#FFF0F5] px-2.5 py-0.5 rounded-full border border-[#E84F87]/20">
            Welcome to Dew & Go
          </span>
          <h1 className="font-heading font-extrabold text-2xl text-[#29242A]">
            Create Customer Account
          </h1>
          <p className="text-xs text-[#756D77]">
            Join Dew & Go for 15-minute express beauty delivery and exclusive member offers
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
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#756D77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Ananya Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#EFE7E1] bg-white text-[#29242A] placeholder-[#9E97A0] focus:outline-none focus:border-[#721C46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#756D77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ananya@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#EFE7E1] bg-white text-[#29242A] placeholder-[#9E97A0] focus:outline-none focus:border-[#721C46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#756D77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#EFE7E1] bg-white text-[#29242A] placeholder-[#9E97A0] focus:outline-none focus:border-[#721C46]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1">
              Password * (Min. 8 characters, letters & numbers)
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

          <div>
            <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#756D77] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#EFE7E1] bg-white text-[#29242A] placeholder-[#9E97A0] focus:outline-none focus:border-[#721C46]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full dew-btn-berry !py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-2"
          >
            {isLoading ? <span>Creating Account...</span> : <span>Create Account</span>}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 text-center text-xs text-[#756D77] space-y-3">
          <p>
            Already have an account?{' '}
            <button
              onClick={() => onNavigate(redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login')}
              className="font-bold text-[#721C46] hover:underline"
            >
              Sign In
            </button>
          </p>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-center gap-2 text-[11px] text-[#267653]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Encrypted credentials • Role restricted to customer</span>
          </div>
        </div>

      </div>
    </div>
  );
};
