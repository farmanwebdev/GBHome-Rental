'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Phone, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, setAuth, token } = useAuthStore();

  const [profile, setProfile] = useState({ name: '', phone: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/login?redirect=/profile');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) setProfile({ name: user.name, phone: user.phone || '' });
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile(profile);
      setAuth(res.data.user, token!);
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match'); return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters'); return;
    }
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700 border-purple-200',
    owner: 'bg-blue-100 text-blue-700 border-blue-200',
    user:  'bg-gray-100 text-gray-600 border-gray-200',
  };

  if (isLoading) return (
    <AuthProvider><div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#131849] border-t-transparent rounded-full" />
      </div>
    </div></AuthProvider>
  );

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pt-20">
          {/* Header */}
          <div className="bg-[#131849] py-10 px-4">
            <div className="max-w-3xl mx-auto sm:px-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-[#131849] font-display font-bold text-2xl">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-yellow-400 text-xs font-semibold tracking-widest uppercase mb-1">My Account</p>
                  <h1 className="font-display text-3xl font-bold text-white">{user?.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${ROLE_COLORS[user?.role || 'user']}`}>
                      {user?.role}
                    </span>
                    <span className="text-white/50 text-xs">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">

            {/* Profile info */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <User size={16} className="text-blue-600" />
                </div>
                <h2 className="font-display font-bold text-lg text-[#131849]">Personal Information</h2>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        required
                        value={profile.name}
                        onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={e => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={user?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={savingProfile}
                    className="flex items-center gap-2 bg-[#131849] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a2680] transition-all disabled:opacity-50 text-sm shadow-md">
                    {savingProfile
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                      : <><CheckCircle size={15} />Save Profile</>
                    }
                  </button>
                </div>
              </form>
            </div>

            {/* Change password */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center">
                  <Lock size={16} className="text-amber-600" />
                </div>
                <h2 className="font-display font-bold text-lg text-[#131849]">Change Password</h2>
              </div>

              <form onSubmit={handlePasswordSave} className="space-y-4">
                {[
                  { key: 'currentPassword', label: 'Current Password', placeholder: 'Your current password' },
                  { key: 'newPassword',     label: 'New Password',     placeholder: 'At least 6 characters' },
                  { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        required
                        value={passwords[key as keyof typeof passwords]}
                        onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"
                      />
                    </div>
                  </div>
                ))}

                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} className="accent-[#131849]" />
                  Show passwords
                </label>

                {passwords.newPassword && passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword && (
                  <div className="flex items-center gap-2 text-red-500 text-xs">
                    <AlertCircle size={13} /> Passwords do not match
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button type="submit" disabled={savingPassword}
                    className="flex items-center gap-2 bg-amber-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-50 text-sm shadow-md">
                    {savingPassword
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Updating…</>
                      : <><CheckCircle size={15} />Update Password</>
                    }
                  </button>
                </div>
              </form>
            </div>

            {/* Account info card */}
            <div className="bg-[#131849]/5 border border-[#131849]/10 rounded-2xl p-5">
              <h3 className="font-semibold text-[#131849] text-sm mb-3">Account Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Account Type</p>
                  <p className="font-semibold text-gray-800 capitalize">{user?.role}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Member Since</p>
                  <p className="font-semibold text-gray-800">
                    {user && 'createdAt' in user && (user as any).createdAt
                      ? new Date((user as any).createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : '—'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
