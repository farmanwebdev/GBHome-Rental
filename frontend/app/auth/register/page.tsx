'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, User, Phone, CreditCard, Info, CheckCircle } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import AuthProvider from '@/components/ui/AuthProvider';
import toast from 'react-hot-toast';

// CNIC format validator: XXXXX-XXXXXXX-X
const validateCnic = (v: string) => /^\d{5}-\d{7}-\d{1}$/.test(v);

// Auto-format as user types: insert dashes at positions 5 and 13
const formatCnic = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5)  return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
};

export default function RegisterPage() {
  const router  = useRouter();
  const params  = useSearchParams();
  const { setAuth, user } = useAuthStore();

  const [form, setForm] = useState({
    name: '', email: '', cnic: '', phone: '',
    password: '', confirmPassword: '',
    role: params.get('role') === 'owner' ? 'owner' : 'user',
  });
  const [show, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.replace('/'); }, [user, router]);

  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, cnic: formatCnic(e.target.value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCnic(form.cnic)) {
      toast.error('CNIC must be in format XXXXX-XXXXXXX-X'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match'); return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      const res = await authAPI.register(data);
      setAuth(res.data.user, res.data.token);
      toast.success('Account created! Welcome to GBRentals.');
      router.push(res.data.user.role === 'owner' ? '/dashboard/owner' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const cnicValid = validateCnic(form.cnic);

  return (
    <AuthProvider>
      <div className="min-h-screen flex">
        {/* Left panel */}
        <div className="hidden lg:flex flex-col justify-between w-5/12 bg-[#131849] p-12 relative overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?w=900" alt="" className="w-full h-full object-cover opacity-20" />
          </div>
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-[#131849] font-bold text-sm">GB</div>
              <span className="font-display font-bold text-2xl text-white">Rentals</span>
            </Link>
          </div>
          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-4xl font-bold text-white leading-tight">
              Join thousands of<br /><span className="text-yellow-400">verified members.</span>
            </h2>
            <p className="text-white/60">Your CNIC ensures a trusted, verified community.</p>
            <div className="space-y-3">
              {['CNIC-verified accounts', 'Secure rent records', 'Monthly payment tracking', 'CNIC-backed bookings'].map(f => (
                <div key={f} className="flex items-center gap-2 text-white/80 text-sm">
                  <CheckCircle size={15} className="text-yellow-400 shrink-0" />{f}
                </div>
              ))}
            </div>
          </div>
          <p className="relative z-10 text-white/30 text-sm">© 2026 GBRentals</p>
        </div>

        {/* Right form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
          <div className="w-full max-w-lg py-8">
            <div className="lg:hidden flex justify-center mb-8">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#131849] rounded-xl flex items-center justify-center text-yellow-400 font-bold text-sm">GB</div>
                <span className="font-display font-bold text-2xl text-[#131849]">Rentals</span>
              </Link>
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="mb-6">
                <h1 className="font-display text-3xl font-bold text-[#131849] mb-2">Create account</h1>
                <p className="text-gray-500 text-sm">Your CNIC is required for identity verification</p>
              </div>

              {/* Role toggle */}
              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
                {[{ val:'user', label:'Tenant / Buyer' }, { val:'owner', label:'Property Owner' }].map(({ val, label }) => (
                  <button key={val} type="button" onClick={() => setForm({ ...form, role: val })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${form.role===val ? 'bg-white text-[#131849] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                    {label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Muhammad Ali"
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm" />
                  </div>
                </div>

                {/* CNIC — full width, prominent */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CNIC Number * <span className="text-xs font-normal text-gray-400">(National Identity Card)</span>
                  </label>
                  <div className="relative">
                    <CreditCard size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      value={form.cnic}
                      onChange={handleCnicChange}
                      placeholder="35201-1234567-9"
                      maxLength={15}
                      className={`w-full pl-11 pr-10 py-3.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 font-mono tracking-wider ${
                        form.cnic && !cnicValid
                          ? 'border-red-300 bg-red-50 focus:ring-red-300/30 focus:border-red-400'
                          : cnicValid
                          ? 'border-emerald-300 bg-emerald-50 focus:ring-emerald-300/30 focus:border-emerald-400'
                          : 'border-gray-200 focus:ring-[#131849]/20 focus:border-[#131849]'
                      }`}
                    />
                    {cnicValid && (
                      <CheckCircle size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                  </div>
                  <p className={`text-xs mt-1.5 flex items-center gap-1 ${form.cnic && !cnicValid ? 'text-red-500' : 'text-gray-400'}`}>
                    <Info size={11} />
                    {form.cnic && !cnicValid ? 'Invalid format. Use: XXXXX-XXXXXXX-X' : 'Format: 35201-1234567-9'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm" />
                    </div>
                  </div>
                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                        placeholder="+92-300-1234567"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm" />
                    </div>
                  </div>
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={show ? 'text' : 'password'} required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                        placeholder="Min. 6 characters"
                        className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm" />
                      <button type="button" onClick={() => setShow(!show)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        {show ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type={show ? 'text' : 'password'} required value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="Repeat password"
                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm" />
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading || (!!form.cnic && !cnicValid)}
                  className="w-full bg-[#131849] text-white font-bold py-4 rounded-xl hover:bg-[#1a2680] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 text-sm mt-2">
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[#131849] font-semibold hover:text-yellow-500 transition-colors">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}
