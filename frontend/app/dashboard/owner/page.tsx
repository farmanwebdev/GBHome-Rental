'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Building2, MessageSquare, Plus, Eye, Edit, Trash2, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';
import { ownerAPI, propertyAPI, inquiryAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Property, Inquiry } from '@/types';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700',
  pending:  'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-600',
  rented:   'bg-blue-100 text-blue-700',
  sold:     'bg-gray-100 text-gray-600',
};

const STATUS_ICONS: Record<string, any> = {
  approved: CheckCircle,
  pending:  Clock,
  rejected: XCircle,
  rented:   AlertCircle,
  sold:     AlertCircle,
};

export default function OwnerDashboard() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [stats, setStats]         = useState<any>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries]   = useState<Inquiry[]>([]);
  const [activeTab, setActiveTab]   = useState<'overview'|'properties'|'inquiries'>('overview');
  const [loading, setLoading]       = useState(true);
  const [replyModal, setReplyModal] = useState({ open:false, id:'', text:'' });

  useEffect(() => {
    if (!isLoading && (!user || (user.role!=='owner' && user.role!=='admin'))) {
      router.replace('/auth/login?redirect=/dashboard/owner');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([ownerAPI.getDashboard(), ownerAPI.getProperties(), inquiryAPI.getOwner()])
      .then(([dash, props, inqs]) => {
        setStats(dash.data.stats);
        setProperties(props.data.properties);
        setInquiries(inqs.data.inquiries);
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await ownerAPI.updateStatus(id, status);
      setProperties(prev => prev.map(p => p._id===id ? { ...p, status: status as any } : p));
      toast.success('Status updated');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this property? This cannot be undone.')) return;
    try {
      await propertyAPI.delete(id);
      setProperties(prev => prev.filter(p => p._id!==id));
      toast.success('Property deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleReply = async () => {
    try {
      await inquiryAPI.reply(replyModal.id, replyModal.text);
      setInquiries(prev => prev.map(i => i._id===replyModal.id ? { ...i, status:'replied', reply:replyModal.text } : i));
      setReplyModal({ open:false, id:'', text:'' });
      toast.success('Reply sent!');
    } catch { toast.error('Failed'); }
  };

  if (loading || isLoading) return (
    <AuthProvider><div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#131849] border-t-transparent rounded-full"/>
      </div>
    </div></AuthProvider>
  );

  const STAT_CARDS = [
    { icon: Building2,    label: 'Total Properties', value: stats?.totalProperties||0, color:'bg-blue-50 text-blue-600' },
    { icon: MessageSquare,label: 'New Inquiries',    value: stats?.newInquiries||0,    color:'bg-amber-50 text-amber-600' },
    { icon: CheckCircle,  label: 'Approved',         value: stats?.statusCounts?.find((s:any)=>s._id==='approved')?.count||0, color:'bg-emerald-50 text-emerald-600' },
    { icon: Clock,        label: 'Pending Review',   value: stats?.statusCounts?.find((s:any)=>s._id==='pending')?.count||0,  color:'bg-orange-50 text-orange-600' },
  ];

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar/>
        <main className="flex-1 pt-20">
          <div className="bg-[#131849] py-10 px-4">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-semibold mb-1">Owner Dashboard</p>
                <h1 className="font-display text-3xl font-bold text-white">Welcome, {user?.name}!</h1>
              </div>
              <Link href="/properties/new" className="flex items-center gap-2 bg-yellow-400 text-[#131849] font-bold px-5 py-3 rounded-xl hover:bg-yellow-500 transition-all text-sm shadow-lg">
                <Plus size={16}/>Add Property
              </Link>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {STAT_CARDS.map(({ icon:Icon, label, value, color }) => (
                <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon size={20}/></div>
                  <div className="font-display text-2xl font-bold text-[#131849]">{value}</div>
                  <div className="text-xs text-gray-500 mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 gap-1">
              {(['overview','properties','inquiries'] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab===tab?'border-[#131849] text-[#131849]':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab}
                  {tab==='inquiries' && inquiries.filter(i=>i.status==='new').length>0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{inquiries.filter(i=>i.status==='new').length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab==='overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-display font-bold text-lg text-[#131849] mb-4">My Properties</h3>
                  {properties.slice(0,4).map((p) => {
                    const StatusIcon = STATUS_ICONS[p.status] || Clock;
                    return (
                      <div key={p._id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                          {p.images?.[0] && <Image src={p.images[0].url} alt={p.title} fill className="object-cover" sizes="48px" unoptimized/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.title}</p>
                          <p className="text-xs text-gray-500">${p.price.toLocaleString()}/mo</p>
                          {p.rejectedReason && <p className="text-xs text-red-500 mt-0.5">Reason: {p.rejectedReason}</p>}
                        </div>
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[p.status]}`}>
                          <StatusIcon size={10}/>{p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h3 className="font-display font-bold text-lg text-[#131849] mb-4">Recent Inquiries</h3>
                  {inquiries.slice(0,4).length===0
                    ? <p className="text-sm text-gray-400 py-6 text-center">No inquiries yet</p>
                    : inquiries.slice(0,4).map((inq) => (
                      <div key={inq._id} className="py-3 border-b border-gray-50 last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-800">{inq.sender?.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${inq.status==='new'?'bg-red-100 text-red-600':'bg-gray-100 text-gray-500'}`}>{inq.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{inq.message}</p>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Properties table */}
            {activeTab==='properties' && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-display font-bold text-lg text-[#131849]">My Properties ({properties.length})</h3>
                  <Link href="/properties/new" className="flex items-center gap-1.5 text-sm font-semibold text-[#131849] hover:text-yellow-500 transition-colors">
                    <Plus size={15}/>Add New
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="px-5 py-3 text-left">Property</th>
                        <th className="px-5 py-3 text-left">Price</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Views</th>
                        <th className="px-5 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {properties.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/50">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                {p.images?.[0] && <Image src={p.images[0].url} alt="" fill className="object-cover" sizes="40px" unoptimized/>}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.title}</p>
                                <p className="text-xs text-gray-400">{p.location.city}</p>
                                {p.status==='rejected' && p.rejectedReason && (
                                  <p className="text-xs text-red-500 mt-0.5 line-clamp-1">❌ {p.rejectedReason}</p>
                                )}
                                {p.status==='pending' && (
                                  <p className="text-xs text-amber-600 mt-0.5">⏳ Awaiting admin review</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-[#131849]">${p.price.toLocaleString()}</td>
                          <td className="px-5 py-4">
                            {/* Owner can only mark approved listings as rented/sold */}
                            {p.status==='approved' ? (
                              <select value={p.status} onChange={(e)=>handleStatusChange(p._id,e.target.value)}
                                className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${STATUS_COLORS[p.status]}`}>
                                <option value="approved">Approved</option>
                                <option value="rented">Rented</option>
                                <option value="sold">Sold</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[p.status]}`}>
                                {p.status}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">{p.views||0}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link href={`/properties/${p._id}`} className="p-1.5 text-gray-400 hover:text-[#131849] transition-colors"><Eye size={15}/></Link>
                              <Link href={`/properties/${p._id}/edit`} className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"><Edit size={15}/></Link>
                              <button onClick={()=>handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inquiries */}
            {activeTab==='inquiries' && (
              <div className="space-y-4">
                {inquiries.length===0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <MessageSquare size={40} className="mx-auto mb-3 opacity-30"/>
                    <p>No inquiries yet.</p>
                  </div>
                ) : inquiries.map((inq) => (
                  <div key={inq._id} className={`bg-white rounded-2xl border p-5 ${inq.status==='new'?'border-amber-200':'border-gray-100'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 bg-[#131849] rounded-full flex items-center justify-center text-white text-xs font-bold">{inq.sender?.name?.[0]?.toUpperCase()}</div>
                          <span className="font-semibold text-sm text-gray-800">{inq.sender?.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${inq.status==='new'?'bg-red-100 text-red-600':inq.status==='replied'?'bg-emerald-100 text-emerald-600':'bg-gray-100 text-gray-500'}`}>{inq.status}</span>
                        </div>
                        <p className="text-xs text-gray-400">{inq.sender?.email} · {new Date(inq.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Link href={`/properties/${inq.property?._id}`} className="text-xs text-[#131849] font-semibold hover:underline">{inq.property?.title}</Link>
                    </div>
                    <p className="text-sm text-gray-700 mb-3 bg-gray-50 rounded-xl p-3">{inq.message}</p>
                    {inq.phone && <p className="text-xs text-gray-500 mb-3">📞 {inq.phone}</p>}
                    {inq.reply && <p className="text-sm text-emerald-700 bg-emerald-50 rounded-xl p-3 mb-3"><span className="font-semibold">Your reply:</span> {inq.reply}</p>}
                    {inq.status!=='replied' && (
                      <button onClick={()=>setReplyModal({open:true,id:inq._id,text:''})} className="text-sm font-semibold text-[#131849] hover:text-yellow-500 transition-colors flex items-center gap-1">
                        <MessageSquare size={14}/>Reply
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer/>

        {replyModal.open && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={()=>setReplyModal({open:false,id:'',text:''})}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e=>e.stopPropagation()}>
              <h3 className="font-display font-bold text-lg text-[#131849] mb-4">Send Reply</h3>
              <textarea rows={4} value={replyModal.text} onChange={e=>setReplyModal({...replyModal,text:e.target.value})} placeholder="Type your reply..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] mb-4"/>
              <div className="flex gap-3">
                <button onClick={()=>setReplyModal({open:false,id:'',text:''})} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleReply} disabled={!replyModal.text.trim()} className="flex-1 py-2.5 bg-[#131849] text-white rounded-xl text-sm font-bold hover:bg-[#1a2680] disabled:opacity-50">Send Reply</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthProvider>
  );
}
