import React, { useState } from 'react';
import { Eye, EyeOff, HelpCircle, AlertCircle, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch, getToken } from '../api/api';

type Role = 'admin' | 'agm' | 'rm' | 'bdm';

export function CreateAccountPage() {
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName]                 = useState('');
  const [phone, setPhone]                       = useState('');
  const [email, setEmail]                       = useState('');
  const [role, setRole]                         = useState<Role | ''>('');
  const [password, setPassword]                 = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [loading, setLoading]                   = useState(false);
  const [error, setError]                       = useState('');
  const [success, setSuccess]                   = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/api/users', {
        method: 'POST',
        auth: true, // sends stored admin JWT if available
        body: JSON.stringify({
          full_name: fullName,
          email,
          password,
          role,
          phone: phone || undefined,
        }),
      });

      setSuccess('Account created successfully! The user can now log in.');
      // Reset form
      setFullName(''); setPhone(''); setEmail('');
      setRole(''); setPassword(''); setConfirmPassword('');

      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('401')) {
        setError('Only an Admin can create new accounts. Please log in as Admin first.');
      } else if (err instanceof Error && err.message.includes('403')) {
        setError('Access denied. Only Admin accounts can register new users.');
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isAdminLoggedIn = !!getToken();

  return (
    <div className="min-h-screen w-full flex font-sans bg-gray-50">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex w-1/2 relative bg-brand-navy overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=2000"
            alt="Solar Panels"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/80 via-brand-navy/60 to-brand-navy/90"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 p-16 flex flex-col justify-center h-full text-white max-w-xl">
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Empowering the Future of Energy
          </h1>
          <p className="text-lg text-gray-300 mb-16 leading-relaxed">
            Join the lead in sustainable energy management. Our advanced solar
            analytics platform provides the precision and technical stewardship
            needed for commercial operations worldwide.
          </p>

          <div className="flex gap-16">
            <div>
              <div className="text-4xl font-light mb-2">98.4%</div>
              <div className="text-sm text-gray-400 font-medium">Uptime Reliability</div>
            </div>
            <div>
              <div className="text-4xl font-light mb-2">1.2 GW</div>
              <div className="text-sm text-gray-400 font-medium">Managed Power</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-16 relative">
        {/* Help Button */}
        <button className="absolute bottom-8 right-8 w-12 h-12 bg-brand-navy text-white rounded-full flex items-center justify-center shadow-lg hover:bg-brand-navy-light transition-colors">
          <HelpCircle size={24} />
        </button>

        <div className="w-full max-w-md">
          {/* Logo Header */}
          <div className="mb-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-brand-green flex items-center justify-center rounded-sm font-bold text-white text-xl">
                E3
              </div>
              <div className="flex flex-col text-left">
                <span className="text-brand-navy font-bold leading-none text-lg">HIRUJAYA</span>
                <span className="text-brand-green font-bold leading-none text-lg">GREEN</span>
                <span className="text-brand-navy font-bold leading-none text-lg">ENERGY</span>
                <span className="text-brand-navy text-[8px] tracking-widest mt-1">PURE POWER</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-brand-navy mb-1">HIRUNJAYA GREEN</h2>
            <p className="text-gray-500 text-sm">Energy Management Portal</p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Create New Account</h3>
            <p className="text-gray-500 text-sm">
              {isAdminLoggedIn
                ? 'Fill in the details to create a new user account.'
                : 'Admin login required to create accounts. Please log in first.'}
            </p>
          </div>

          {/* Admin warning banner */}
          {!isAdminLoggedIn && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>Only an <strong>Admin</strong> can create new user accounts. You must be logged in as Admin to proceed.</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-5">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-5">
              <CheckCircle2 size={16} className="shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="flex gap-4">
              {/* Full Name */}
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  id="reg-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all bg-white"
                  required
                  disabled={loading}
                />
              </div>
              {/* Phone */}
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-700">Phone (optional)</label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+94 77 123 4567"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all bg-white"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="reg-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all bg-white"
                required
                disabled={loading}
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Role Selection</label>
              <select
                id="reg-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all bg-white appearance-none"
                required
                disabled={loading}
              >
                <option value="" disabled>Select Role</option>
                <option value="admin">Admin</option>
                <option value="agm">AGM</option>
                <option value="rm">RM</option>
                <option value="bdm">BDM</option>
              </select>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all bg-white"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="relative">
                <input
                  id="reg-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all bg-white"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-brand-green hover:bg-brand-green-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-lg transition-colors shadow-md shadow-brand-green/20 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={() => navigate('/admin/dashboard')}
                className="text-sm font-semibold text-brand-navy hover:text-brand-green transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
            )}
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-brand-navy font-bold hover:text-brand-green transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>

          <div className="mt-16 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              © 2024 HIRUNJAYA GREEN ENERGY. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}