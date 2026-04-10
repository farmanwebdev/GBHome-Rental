'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users, Building2, MessageSquare, Clock,
  CheckCircle, XCircle, Star, Trash2, Ban, AlertTriangle, Eye,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';
import { adminAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Property, User } from '@/types';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
  rented:   'bg-blue-100 text-blue-700',
  sold:     'bg-gray-100 text-gray-600',
};
const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  owner: 'bg-blue-100 text-blue-700',
  user:  'bg-gray-100 text-gray-600',
};
const STATUS_TABS = [
  { key: 'all', label: 'All' }, { key: 'pending', label: 'Pending' },
  { key: 'approved', label: 'Approved' }, { key: 'rejected', label: 'Rejected' },
  { key: 'rented', label: 'Rented' }, { key: 'sold', label: 'Sold' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [stats, setStats]           = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [users, setUsers]           = useState<User[]>([]);
  const [activeTab, setActiveTab]   = useState<'overview'|'properties'|'users'>('overview');
  const [propFilter, setPropFilter] = useState('all');
  const [loading, setLoading]       = useState(true);
  const [rejectModal, setRejectModal] = useState({ open:false, id:'', reason:'' });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) router.replace('/auth/login');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    Promise.all([adminAPI.getDashboard(), adminAPI.getProperties(), adminAPI.getUsers()])
      .then(([dash, props, usrs]) => {
        setStats(dash.data.stats);
        setProperties(props.data.properties);
        setUsers(usrs.data.users);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [user]);

  const reloadProperties = useCallback((filter = propFilter) => {
    adminAPI.getProperties(filter === 'all' ? undefined : filter)
      .then(res => setProperties(res.data.properties))
      .catch(() => {});
  }, [propFilter]);

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approveProperty(id);
      setProperties(prev => prev.map(p => p._id === id ? { ...p, status: 'approved' as any } : p));
      toast.success('✅ Property approved — now live!');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async () => {
    try {
      await adminAPI.rejectProperty(rejectModal.id, rejectModal.reason || undefined);
      setProperties(prev => prev.map(p =>
        p._id === rejectModal.id ? { ...p, status: 'rejected' as any, rejectedReason: rejectModal.reason } : p
      ));
      setRejectModal({ open:false, id:'', reason:'' });
      toast.success('Property rejected');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleFeature = async (p: Property) => {
    try {
      await adminAPI.updateProperty(p._id, { isFeatured: !p.isFeatured, status: p.status });
      setProperties(prev => prev.map(pr => pr._id === p._id ? { ...pr, isFeatured: !p.isFeatured } : pr));
      toast.success(p.isFeatured ? 'Removed from featured' : 'Added to featured!');
    } catch { toast.error('Failed'); }
  };

  const handleUserUpdate = async (id: string, data: any) => {
    try {
      const res = await adminAPI.updateUser(id, data);
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success('Updated');
    } catch { toast.error('Failed'); }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Permanently delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed'); }
  };

  const pendingCount  = properties.filter(p => p.status === 'pending').length;
  const filteredProps = propFilter === 'all' ? properties : properties.filter(p => p.status === propFilter);

  if (loading || isLoading) return (
    <AuthProvider><div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#131849] border-t-transparent rounded-full"/>
      </div>
    </div></AuthProvider>
  );

  const STAT_CARDS = [
    { icon: Users,        label: 'Total Users',      value: stats?.totalUsers      || 0, color:'bg-blue-50 text-blue-600' },
    { icon: Building2,    label: 'Properties',       value: stats?.totalProperties || 0, color:'bg-emerald-50 text-emerald-600' },
    { icon: Clock,        label: 'Pending Review',   value: pendingCount,               color:'bg-amber-50 text-amber-600' },
    { icon: MessageSquare,label: 'Total Inquiries',  value: stats?.totalInquiries  || 0, color:'bg-purple-50 text-purple-600' },
  ];

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pt-20">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#131849] to-[#1a2680] py-10 px-4">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-[#131849] font-bold">A</div>
                <div>
                  <p className="text-yellow-400 text-xs font-semibold tracking-widest uppercase">Admin Panel</p>
                  <h1 className="font-display text-3xl font-bold text-white">Control Center</h1>
                </div>
              </div>
              {pendingCount > 0 && (
                <button onClick={() => { setActiveTab('properties'); setPropFilter('pending'); }}
                  className="flex items-center gap-2 bg-amber-400 text-[#131849] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-amber-500 transition-all shadow-lg animate-pulse">
                  <AlertTriangle size={16}/>{pendingCount} Pending Review
                </button>
              )}
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {STAT_CARDS.map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon size={20}/></div>
                  <div className="font-display text-2xl font-bold text-[#131849]">{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Status distribution */}
            {stats?.statusCounts?.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
                <h3 className="font-display font-bold text-lg text-[#131849] mb-4">Property Status Breakdown</h3>
                <div className="flex flex-wrap gap-3">
                  {stats.statusCounts.map((s: any) => (
                    <button key={s._id}
                      onClick={() => { setActiveTab('properties'); setPropFilter(s._id); }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 ${STATUS_STYLES[s._id] || 'bg-gray-100 text-gray-600'}`}>
                      <span className="font-display text-lg font-bold">{s.count}</span>
                      <span className="capitalize">{s._id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 gap-0.5 overflow-x-auto">
              {(['overview','properties','users'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab===tab?'border-[#131849] text-[#131849]':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                  {tab==='properties' && pendingCount>0 && (
                    <span className="ml-2 bg-amber-400 text-[#131849] text-xs font-bold rounded-full px-1.5 py-0.5">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-amber-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={18} className="text-amber-600"/>
                    <h3 className="font-display font-bold text-lg text-[#131849]">Awaiting Approval ({pendingCount})</h3>
                  </div>
                  {stats?.pendingProperties?.length === 0 ? (
                    <p className="text-sm text-gray-400 py-6 text-center">No pending properties 🎉</p>
                  ) : stats?.pendingProperties?.slice(0,5).map((p: Property) => (
                    <div key={p._id} className="flex items-center gap-3 py-3 border-b border-amber-100 last:border-0">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        {p.images?.[0] && <Image src={p.images[0].url} alt="" fill className="object-cover" sizes="48px" unoptimized/>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                        <p className="text-xs text-gray-400">{p.owner?.name} · {p.location.city}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => handleApprove(p._id)} className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors" title="Approve">
                          <CheckCircle size={15}/>
                        </button>
                        <button onClick={() => setRejectModal({ open:true, id:p._id, reason:'' })} className="p-1.5 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors" title="Reject">
                          <XCircle size={15}/>
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingCount > 5 && (
                    <button onClick={() => { setActiveTab('properties'); setPropFilter('pending'); }} className="mt-3 text-xs font-semibold text-amber-600 hover:underline">
                      View all {pendingCount} pending →
                    </button>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-display font-bold text-lg text-[#131849] mb-4">Recent Users</h3>
                  {users.slice(0,5).map((u) => (
                    <div key={u._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 bg-[#131849] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{u.name[0].toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize whitespace-nowrap ${ROLE_STYLES[u.role]}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PROPERTIES ── */}
            {activeTab === 'properties' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <h3 className="font-display font-bold text-lg text-[#131849]">Properties — {filteredProps.length} shown</h3>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                    {STATUS_TABS.map(({ key, label }) => {
                      const cnt = key==='all' ? properties.length : properties.filter(p=>p.status===key).length;
                      return (
                        <button key={key} onClick={() => { setPropFilter(key); reloadProperties(key); }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${propFilter===key?'bg-[#131849] text-white':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {label}{cnt>0 && <span className="ml-1 opacity-70">({cnt})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-5 py-3 text-left">Property</th>
                        <th className="px-5 py-3 text-left">Owner</th>
                        <th className="px-5 py-3 text-left">Price</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Featured</th>
                        <th className="px-5 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredProps.length===0 ? (
                        <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">No properties in this category</td></tr>
                      ) : filteredProps.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                {p.images?.[0] && <Image src={p.images[0].url} alt="" fill className="object-cover" sizes="40px" unoptimized/>}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.title}</p>
                                <p className="text-xs text-gray-400">{p.location.city} · {p.type}</p>
                                {p.rejectedReason && <p className="text-xs text-red-500 mt-0.5 line-clamp-1">Reason: {p.rejectedReason}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-600">{p.owner?.name}</td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#131849]">${p.price.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[p.status]||'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                          </td>
                          <td className="px-5 py-4">
                            <button onClick={() => handleFeature(p)}
                              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${p.isFeatured?'bg-yellow-100 text-yellow-600 hover:bg-yellow-200':'bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500'}`}>
                              <Star size={11} fill={p.isFeatured?'currentColor':'none'}/>{p.isFeatured?'Featured':'Feature'}
                            </button>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {p.status==='pending' && <>
                                <button onClick={() => handleApprove(p._id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors">
                                  <CheckCircle size={12}/>Approve
                                </button>
                                <button onClick={() => setRejectModal({ open:true, id:p._id, reason:'' })} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-200 transition-colors">
                                  <XCircle size={12}/>Reject
                                </button>
                              </>}
                              {p.status==='rejected' && (
                                <button onClick={() => handleApprove(p._id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-200 transition-colors">
                                  <CheckCircle size={12}/>Approve
                                </button>
                              )}
                              <Link href={`/properties/${p._id}`} className="p-1.5 text-gray-400 hover:text-[#131849] transition-colors" title="View">
                                <Eye size={14}/>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── USERS ── */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-display font-bold text-lg text-[#131849]">All Users ({users.length})</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-5 py-3 text-left">User</th>
                        <th className="px-5 py-3 text-left">Email</th>
                        <th className="px-5 py-3 text-left">Role</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Joined</th>
                        <th className="px-5 py-3 text-left">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-[#131849] rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{u.name[0].toUpperCase()}</div>
                              <span className="text-sm font-semibold text-gray-800">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                          <td className="px-5 py-3">
                            <select value={u.role} onChange={(e)=>handleUserUpdate(u._id,{role:e.target.value})} disabled={u._id===user?._id}
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer disabled:cursor-default ${ROLE_STYLES[u.role]}`}>
                              {['user','owner','admin'].map(r=><option key={r} value={r} className="text-gray-800 bg-white capitalize">{r}</option>)}
                            </select>
                          </td>
                          <td className="px-5 py-3">
                            <button onClick={()=>handleUserUpdate(u._id,{isActive:!u.isActive})} disabled={u._id===user?._id}
                              className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${u.isActive?'bg-emerald-100 text-emerald-600 hover:bg-red-100 hover:text-red-500':'bg-red-100 text-red-600 hover:bg-emerald-100 hover:text-emerald-600'}`}>
                              {u.isActive?<><CheckCircle size={11}/>Active</>:<><Ban size={11}/>Banned</>}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-400">{u.createdAt?new Date(u.createdAt).toLocaleDateString():'—'}</td>
                          <td className="px-5 py-3">
                            {u._id!==user?._id && (
                              <button onClick={()=>handleDeleteUser(u._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
        <Footer/>

        {/* Reject modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={()=>setRejectModal({open:false,id:'',reason:''})}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e=>e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><XCircle size={20} className="text-red-500"/></div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#131849]">Reject Property</h3>
                  <p className="text-xs text-gray-500">The owner will see your reason.</p>
                </div>
              </div>
              <textarea rows={3} value={rejectModal.reason} onChange={e=>setRejectModal({...rejectModal,reason:e.target.value})}
                placeholder="Reason for rejection (optional)..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 mb-4"/>
              <div className="flex gap-3">
                <button onClick={()=>setRejectModal({open:false,id:'',reason:''})} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleReject} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600">Confirm Rejection</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthProvider>
  );
}
