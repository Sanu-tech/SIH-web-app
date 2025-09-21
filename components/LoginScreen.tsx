import React, { useState, useEffect, useMemo } from 'react';
import { InstitutionId, UserRole } from '../types';
import { TENANTS, Tenant } from '../tenants';
import { EnvelopeIcon, SearchIcon } from './icons/Icons';

interface LoginScreenProps {
  onLogin: (role: 'student' | 'teacher', institutionId: InstitutionId, credentials: { loginId: string }) => boolean;
  onSignUp: (role: 'student' | 'teacher', institutionId: InstitutionId, details: { name: string; email: string; idNumber: string }) => { success: boolean; message?: string };
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgotPassword'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [institutionId, setInstitutionId] = useState<InstitutionId>('default');
  
  // Login state
  const [loginId, setLoginId] = useState('');
  
  // SignUp state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [idNumber, setIdNumber] = useState('');
  
  // Forgot Password state
  const [resetEmail, setResetEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const [error, setError] = useState('');

  const [selectedTenant, setSelectedTenant] = useState<Tenant>(TENANTS['default']);
  const [searchQuery, setSearchQuery] = useState('');

  const allTenants = useMemo(() => Object.values(TENANTS).sort((a, b) => a.name.localeCompare(b.name)), []);

  const filteredTenants = useMemo(() => {
    if (!searchQuery) {
      return allTenants;
    }
    return allTenants.filter(tenant =>
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allTenants]);


  useEffect(() => {
    const tenant = TENANTS[institutionId] || TENANTS['default'];
    setSelectedTenant(tenant);
    document.documentElement.style.setProperty('--color-primary', tenant.colors.primary);
    document.documentElement.style.setProperty('--color-primary-dark', tenant.colors.primaryDark);
  }, [institutionId]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    const success = onLogin(role, institutionId, { loginId });
    if (!success) {
      setError('Invalid credentials. Please try again.');
    } else {
      setError('');
    }
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Please select a role.');
      return;
    }
    const result = onSignUp(role, institutionId, { name, email, idNumber });
    if (!result.success) {
      setError(result.message || 'Sign up failed. Please try again.');
    } else {
      setError('');
    }
  };
  
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
        setError("Please enter your email address.");
        return;
    }
    console.log(`Password reset requested for: ${resetEmail}`);
    setResetEmailSent(true);
    setError('');
  };
  
  const switchMode = (newMode: 'login' | 'signup' | 'forgotPassword') => {
      setMode(newMode);
      setError('');
      setLoginId('');
      setName('');
      setEmail('');
      setIdNumber('');
      setResetEmail('');
      setResetEmailSent(false);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-surface/50 backdrop-blur-xl rounded-box shadow-card p-8 border border-white/20 animate-fade-in dark:bg-neutral-900/50 dark:border-white/10 transition-colors duration-300">
            <div className="flex flex-col items-center justify-center mb-6 min-h-[64px]">
                 <h1 className="text-2xl font-bold text-center text-surface-content dark:text-white">
                   {selectedTenant.name}
                 </h1>
            </div>

          <div className="mb-6">
            <label htmlFor="institution-search" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Find your institution</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </div>
                <input
                    type="search"
                    id="institution-search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 pl-10 bg-white/50 border border-white/30 rounded-btn focus:ring-2 focus:ring-primary/50 text-surface-content placeholder-neutral-content/60 dark:bg-neutral-800 dark:border-white/20 dark:text-white dark:placeholder-neutral-400 transition-colors duration-300"
                />
            </div>
            <div className="mt-2 bg-white/20 border border-white/20 rounded-btn max-h-60 overflow-y-auto dark:bg-neutral-800/50 dark:border-white/10 transition-colors duration-300">
                {filteredTenants.length > 0 ? (
                    filteredTenants.map(tenant => (
                        <button
                            key={tenant.id}
                            type="button"
                            onClick={() => setInstitutionId(tenant.id)}
                            className={`w-full text-left p-3 flex items-center transition-colors duration-200 border-b border-white/10 last:border-b-0 dark:border-white/5 ${institutionId === tenant.id ? 'bg-white/30 dark:bg-white/10' : 'hover:bg-white/20 dark:hover:bg-white/5'}`}
                        >
                            <span style={{ color: institutionId === tenant.id ? 'var(--color-primary)' : '' }} className="font-semibold text-surface-content dark:text-neutral-200">{tenant.name}</span>
                        </button>
                    ))
                ) : (
                    <p className="text-center p-4 text-neutral-content/80 dark:text-neutral-400">No institutions found.</p>
                )}
            </div>
          </div>
          
          {mode !== 'forgotPassword' ? (
            <>
              <div className="flex border-b border-white/20 dark:border-white/10 mb-6">
                <button
                  onClick={() => switchMode('login')}
                  className={`w-1/2 py-3 text-center font-semibold transition-colors ${mode === 'login' ? 'border-b-2 text-surface-content dark:text-white' : 'text-neutral-content/70 dark:text-neutral-400 hover:bg-white/10 dark:hover:bg-white/5'}`}
                  style={{ borderColor: mode === 'login' ? 'var(--color-primary)' : 'transparent', color: mode === 'login' ? 'var(--color-primary)' : ''}}
                >
                  Login
                </button>
                <button
                  onClick={() => switchMode('signup')}
                  className={`w-1/2 py-3 text-center font-semibold transition-colors ${mode === 'signup' ? 'border-b-2' : 'text-neutral-content/70 dark:text-neutral-400 hover:bg-white/10 dark:hover:bg-white/5'}`}
                   style={{ borderColor: mode === 'signup' ? 'var(--color-primary)' : 'transparent', color: mode === 'signup' ? 'var(--color-primary)' : ''}}
                >
                  Sign Up
                </button>
              </div>
              
              <div className="mb-4">
                  <span className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-2">I am a...</span>
                  <div className="flex space-x-4">
                      <button onClick={() => setRole('student')} className={`w-1/2 p-3 rounded-btn font-semibold text-center transition-all duration-200 ${role === 'student' ? 'text-white scale-105' : 'bg-white/40 text-neutral-content dark:bg-neutral-700 dark:text-neutral-300'}`}
                        style={{ backgroundColor: role === 'student' ? 'var(--color-primary)' : '' }}>
                          Student
                      </button>
                      <button onClick={() => setRole('teacher')} className={`w-1/2 p-3 rounded-btn font-semibold text-center transition-all duration-200 ${role === 'teacher' ? 'text-white scale-105' : 'bg-white/40 text-neutral-content dark:bg-neutral-700 dark:text-neutral-300'}`}
                         style={{ backgroundColor: role === 'teacher' ? 'var(--color-primary)' : '' }}>
                          Teacher
                      </button>
                  </div>
              </div>

              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="loginId" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Email</label>
                    <input
                      type="email"
                      id="loginId"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className="w-full p-3 bg-white/50 border border-white/30 rounded-btn focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder-neutral-content/60 dark:bg-neutral-800 dark:border-white/20 dark:text-white dark:placeholder-neutral-400 transition-colors duration-300"
                      required
                      placeholder={role === 'student' ? "student@example.com" : "teacher@example.com"}
                    />
                  </div>
                  <div className="text-right text-sm">
                    <button type="button" onClick={() => switchMode('forgotPassword')} className="font-medium hover:underline focus:outline-none" style={{ color: 'var(--color-primary)' }}>
                      Forgot Password?
                    </button>
                  </div>
                  <p className="text-xs text-neutral-content/70 dark:text-neutral-500">
                    For demo purposes, password is not required.
                  </p>
                  <button type="submit" className="w-full px-4 py-3 text-white font-bold rounded-btn shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: `linear-gradient(45deg, var(--color-primary), var(--color-primary-dark))` }}>
                    Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignUpSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Full Name</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-white/50 border border-white/30 rounded-btn focus:ring-2 focus:ring-primary/50 dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300" required />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Email Address</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-white/50 border border-white/30 rounded-btn focus:ring-2 focus:ring-primary/50 dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300" required />
                  </div>
                  <div>
                    <label htmlFor="idNumber" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">{role === 'student' ? 'Roll Number' : 'Employee ID'}</label>
                    <input type="text" id="idNumber" value={idNumber} onChange={e => setIdNumber(e.target.value)} className="w-full p-3 bg-white/50 border border-white/30 rounded-btn focus:ring-2 focus:ring-primary/50 dark:bg-neutral-800 dark:border-white/20 dark:text-white transition-colors duration-300" required />
                  </div>
                  <button type="submit" className="w-full px-4 py-3 text-white font-bold rounded-btn shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: `linear-gradient(45deg, var(--color-primary), var(--color-primary-dark))` }}>
                    Create Account
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-surface-content dark:text-white">Forgot Password</h2>
                <p className="text-neutral-content/80 dark:text-neutral-400 mt-1">
                  Enter your email for a reset link.
                </p>
              </div>
              {resetEmailSent ? (
                <div className="p-4 text-center bg-success/20 text-success-content rounded-box border border-success/30">
                  <h3 className="font-semibold">Check your inbox</h3>
                  <p className="text-sm mt-1">A password reset link has been sent to <span className="font-bold">{resetEmail}</span>.</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="resetEmail" className="block text-sm font-medium text-neutral-content/80 dark:text-neutral-400 mb-1">Your Email</label>
                    <div className="relative">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                         <EnvelopeIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                       </div>
                       <input
                          type="email"
                          id="resetEmail"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="w-full p-3 pl-10 bg-white/50 border border-white/30 rounded-btn focus:ring-2 focus:ring-primary/50 placeholder-neutral-content/60 dark:bg-neutral-800 dark:border-white/20 dark:text-white dark:placeholder-neutral-400 transition-colors duration-300"
                          required
                          placeholder="you@example.com"
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full px-4 py-3 text-white font-bold rounded-btn shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" style={{ background: `linear-gradient(45deg, var(--color-primary), var(--color-primary-dark))` }}>
                    Send Reset Link
                  </button>
                </form>
              )}
              <div className="text-center mt-6">
                <button type="button" onClick={() => switchMode('login')} className="text-sm font-medium hover:underline focus:outline-none" style={{ color: 'var(--color-primary)' }}>
                  &larr; Back to Login
                </button>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-center text-sm text-danger font-semibold bg-danger/10 p-3 rounded-btn">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;