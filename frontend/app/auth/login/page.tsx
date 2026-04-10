'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, CreditCard, Info } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import AuthProvider from '@/components/ui/AuthProvider';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, user } = useAuthStore();
  const [form, setForm]   = useState({ identifier: '', password: '' });
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace(
      user.role === 'admin' ? '/dashboard/admin' :
      user.role === 'owner' ? '/dashboard/owner' : '/'
    );
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login({ identifier: form.identifier, password: form.password });
      setAuth(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      router.push(
        res.data.user.role === 'admin' ? '/dashboard/admin' :
        res.data.user.role === 'owner' ? '/dashboard/owner' : '/'
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-[#131849] p-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900" alt="" className="w-full h-full object-cover opacity-20" />
          </div>
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-[#131849] font-bold text-sm">GB</div>
              <span className="font-display font-bold text-2xl text-white">Rentals</span>
            </Link>
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Find your perfect<br /><span className="text-yellow-400">place to call home.</span>
            </h2>
            <p className="text-white/60 text-lg">Thousands of verified listings. One trusted platform.</p>
            <div className="bg-white/10 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-400/20 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard size={16} className="text-yellow-400" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm mb-1">CNIC-Based Login</p>
                  <p className="text-white/60 text-xs leading-relaxed">
                    You can sign in using your CNIC number (e.g. 35201-1234567-9) or email address plus your password.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="relative z-10 text-white/30 text-sm">© 2026 GBRentals</p>
        </div>

        {/* Right form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#131849] rounded-xl flex items-center justify-center text-yellow-400 font-bold text-sm">GB</div>
                <span className="font-display font-bold text-2xl text-[#131849]">Rentals</span>
              </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-[#131849] mb-2">Welcome back</h1>
                <p className="text-gray-500 text-sm">Sign in with your CNIC or email</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CNIC Number or Email
                  </label>
                  <div className="relative">
                    <CreditCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      value={form.identifier}
                      onChange={e => setForm({ ...form, identifier: e.target.value })}
                      placeholder="35201-1234567-9  or  you@email.com"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                    <Info size={11} /> Format: 35201-1234567-9 or email@example.com
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={show ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm transition-all"
                    />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-[#131849] text-white font-bold py-4 rounded-xl hover:bg-[#1a2680] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 text-sm">
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                No account?{' '}
                <Link href="/auth/register" className="text-[#131849] font-semibold hover:text-yellow-500 transition-colors">Create one free</Link>
              </p>
            </div>

            {/* Demo credentials */}
            <div className="mt-4 bg-[#131849]/5 border border-[#131849]/10 rounded-2xl p-4 text-xs text-gray-600 space-y-1.5">
              <p className="font-bold text-[#131849] mb-2">Demo Credentials (login with CNIC or Email):</p>
              <p><span className="font-semibold">Admin CNIC:</span> 35202-0000000-1 / admin123</p>
              <p><span className="font-semibold">Owner CNIC:</span> 35202-1234567-2 / owner123</p>
              <p><span className="font-semibold">Tenant CNIC:</span> 35202-7654321-3 / user123</p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
