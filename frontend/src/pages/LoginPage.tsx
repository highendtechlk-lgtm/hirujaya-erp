import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, saveAuth } from "../api/api";

interface LoginResponse {
  data: {
    token: string;
    user: {
      id: string;
      full_name: string;
      email: string;
      role: "admin" | "agm" | "rm" | "bdm";
      salary_status: string;
    };
  };
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const { token, user } = res.data;
      saveAuth(token, user);

      if (user.role === "admin" || user.role === "agm") {
        navigate("/admin/dashboard");
      } else {
        navigate("/bdm/dashboard");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-brand-blue to-blue-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="mb-8 text-center">
        <img
          src="/logo.png"
          alt="Hirujaya Green Energy"
          className="h-24 object-contain mx-auto mb-4"
        />
        <p className="text-brand-navy-light text-sm font-semibold tracking-widest uppercase">
          Solar Management Systems
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
        <p className="text-gray-500 text-sm mb-8">
          Enter your credentials to access the management dashboard.
        </p>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-6">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                id="login-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@hirujaya.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Password
              </label>
              <a
                href="#"
                className="text-sm font-semibold text-brand-navy hover:text-brand-green transition-colors"
              >
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="login-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="w-4 h-4 text-brand-green border-gray-300 rounded focus:ring-brand-green"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
              Remember this device
            </label>
          </div>

          <button
            type="submit"
            id="login-submit"
            disabled={loading}
            className="w-full bg-brand-green hover:bg-brand-green-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md shadow-brand-green/20"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 mb-4">Don't have an account?</p>
          <Link
            to="/register"
            className="inline-block w-full py-3 px-4 border border-brand-blue text-brand-navy font-semibold rounded-lg hover:bg-brand-blue/50 transition-colors"
          >
            Request Access
          </Link>
        </div>
      </div>

      <div className="mt-12 flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-full">
          <div className="w-8 h-8 rounded-full overflow-hidden border border-white shadow-sm">
            <img
              src="/holdings.png"
              alt="Solar Status"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Platform Status
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-green">
              <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse" />
              All Systems Operational
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          © 2024 Hirujaya Green Energy Solutions. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}

