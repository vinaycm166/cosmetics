import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, MapPin, AlertCircle } from 'lucide-react';
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
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 bg-[#FCFAF9]">
      <div className="max-w-4xl w-full bg-white rounded-2xl border border-[#F0EAE8] shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-12">
        
        {/* Left Column: Sign In Form (Matching Reference Image) */}
        <div className="md:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-burgundy/5 flex items-center justify-center text-burgundy">
                <svg className="w-4 h-4 fill-burgundy" viewBox="0 0 24 24">
                  <path d="M12 2C13.5 5 15.5 6.5 18.5 8C15.5 9.5 13.5 11 12 14C10.5 11 8.5 9.5 5.5 8C8.5 6.5 10.5 5 12 2Z" />
                  <circle cx="12" cy="18" r="2" />
                </svg>
              </div>
              <span className="font-editorial text-2xl font-bold text-charcoal">
                Dew & Go
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-1">
              <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-charcoal tracking-tight">
                Welcome Back
              </h1>
              <p className="text-xs text-muted">
                Sign in to continue to your account
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="vinay18744@gmail.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#EFE7E1] bg-white text-charcoal placeholder:text-muted/60 focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy/20 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-charcoal">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate('/forgot-password')}
                    className="text-xs text-muted hover:text-burgundy transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 pr-10 py-2.5 text-xs rounded-lg border border-[#EFE7E1] bg-white text-charcoal placeholder:text-muted focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Solid Burgundy Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-lg bg-burgundy hover:bg-burgundy-dark text-white text-xs font-bold transition-all shadow-sm active:scale-98 disabled:opacity-60"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Social Divider */}
            <div className="relative text-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F0EAE8]"></div>
              </div>
              <span className="relative bg-white px-3 text-[11px] text-muted">
                or continue with
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => alert('Google Sign-In integration ready.')}
                className="py-2.5 px-4 rounded-lg border border-[#EFE7E1] hover:bg-[#FAF8F6] text-xs font-semibold text-charcoal flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => alert('Apple Sign-In integration ready.')}
                className="py-2.5 px-4 rounded-lg border border-[#EFE7E1] hover:bg-[#FAF8F6] text-xs font-semibold text-charcoal flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4 fill-charcoal" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.64-.78 1.08-1.87.96-2.97-1 .04-2.15.65-2.79 1.42-.57.66-.99 1.76-.85 2.84 1.11.09 2.04-.51 2.68-1.29z"/>
                </svg>
                <span>Apple</span>
              </button>
            </div>

          </div>

          {/* Footer */}
          <div className="pt-6 text-center text-xs text-muted">
            <span>Don't have an account? </span>
            <button
              onClick={() => onNavigate(redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup')}
              className="font-bold text-burgundy hover:underline"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Right Column: Editorial Model Photo with Gokulam Overlay */}
        <div className="hidden md:block md:col-span-5 relative bg-[#FCEFEB]">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
            alt="Beauty Delivered Closer to You"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
          
          {/* Overlay Text Matching Reference Image */}
          <div className="absolute bottom-8 inset-x-8 text-white space-y-2">
            <h3 className="font-editorial text-3xl font-bold leading-tight">
              Beauty <br />
              Delivered <br />
              Closer to You
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-white/90 pt-1">
              <MapPin className="w-3.5 h-3.5 text-rose-300" />
              <span>Gokulam, Mysuru</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
