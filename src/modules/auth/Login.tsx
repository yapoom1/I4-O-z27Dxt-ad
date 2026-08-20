import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';
import { LOGIN_WITH_PASSWORD } from '@/shared/graphql/mutations/auth';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { saveAuthData, getStoredToken, clearStoredAuth } from '@/shared/auth';
import { useAppStore } from '@/shared/stores/useAppStore';

// Re-export clearStoredAuth so AdminLayout doesn't need to import from auth.ts directly.
export { clearStoredAuth };

/**
 * getStoredToken – exported for use in RequireAuth guard.
 * Delegates to the centralized auth utility.
 */
export { getStoredToken };

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useAppStore();
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // If already authenticated, redirect immediately to dashboard.
  useEffect(() => {
    if (getStoredToken()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const [loginWithPassword] = useMutation<any>(LOGIN_WITH_PASSWORD);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!emailOrMobile.trim() || !password.trim()) {
      setErrorMsg('Email/mobile and password are required.');
      return;
    }
    setLocalLoading(true);
    try {
      const { data } = await loginWithPassword({
        variables: { emailOrMobile: emailOrMobile.trim(), password }
      });

      const tokens = data?.adminLoginWithPassword?.tokens;
      const user = data?.adminLoginWithPassword?.user;

      const accessToken = tokens?.accessToken;
      const refreshToken = tokens?.refreshToken ?? '';

      if (accessToken) {
        // Persist tokens using the centralized helper (writes to all required keys).
        saveAuthData(accessToken, refreshToken, {
          id: user?.id ?? '',
          name: user?.name ?? '',
          mobilenumber: user?.mobilenumber ?? '',
          email: user?.email ?? null,
          role: user?.role ?? '',
          status: user?.status ?? '',
        });
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg('No access token received from server. Please try again.');
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message || 'Login failed. Please check your credentials or connection.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />
      </div>

      <div className="w-full max-w-sm mx-4 relative z-10">
        {/* Logo / Brand area */}
        <div className="text-center mb-6">
            <img src="/favicon.svg" alt="Admin Panel" className="h-24 mx-auto object-contain" />
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-xl overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-primary" />

          <div className="p-6 space-y-5">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-foreground">Sign In</h2>
              <p className="text-xs text-muted-foreground">Access your IT inventory, pricing rules, and sales.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email or Mobile */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Email or Mobile
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="login-email"
                    type="text"
                    autoComplete="username"
                    placeholder="admin@example.com or +91..."
                    value={emailOrMobile}
                    onChange={(e) => setEmailOrMobile(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    disabled={localLoading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-9 pr-10 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    disabled={localLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-xs text-destructive font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Submit button */}
              <button
                id="login-submit"
                type="submit"
                disabled={localLoading}
                className="w-full h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                {localLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Secure access protected by JWT. Contact your system administrator for credentials.
        </p>
      </div>
    </div>
  );
};

export default Login;
