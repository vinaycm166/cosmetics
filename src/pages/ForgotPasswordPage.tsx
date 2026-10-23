import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await requestPasswordReset(email);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.error || 'Failed to request password reset.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF7F4]">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-[#EFE7E1] shadow-card">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#FFF0F5] border border-[#E84F87]/20 flex items-center justify-center mx-auto text-[#721C46]">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-[#29242A]">
            Reset Your Password
          </h1>
          <p className="text-xs text-[#756D77]">
            Enter your account email to receive secure recovery instructions
          </p>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">{successMsg}</p>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        {!successMsg ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#29242A] uppercase tracking-wider mb-1.5">
                Registered Email Address
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

            <button
              type="submit"
              disabled={isLoading}
              className="w-full dew-btn-berry !py-3 text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isLoading ? <span>Processing Request...</span> : <span>Send Recovery Instructions</span>}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => onNavigate('/login')}
            className="w-full dew-btn-secondary !py-2.5 text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>Return to Sign In</span>
          </button>
        )}

        {/* Back Link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => onNavigate('/login')}
            className="text-xs font-semibold text-[#721C46] hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </button>
        </div>

      </div>
    </div>
  );
};
