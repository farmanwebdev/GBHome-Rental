'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Upload, CheckCircle, Clock, AlertCircle, XCircle,
  CreditCard, Banknote, ArrowRight, Receipt, Eye
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';
import { bookingAPI, transactionAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getFullImageUrl, shouldUnoptimizeImage } from '@/lib/imageUtils';
import { Booking, Transaction } from '@/types';
import toast from 'react-hot-toast';

const BOOKING_STATUS: Record<string, { color: string; icon: any; label: string }> = {
  pending:   { color:'bg-amber-100 text-amber-700',  icon: Clock,        label:'Pending Review' },
  approved:  { color:'bg-emerald-100 text-emerald-700', icon:CheckCircle, label:'Approved' },
  rejected:  { color:'bg-red-100 text-red-600',       icon: XCircle,     label:'Rejected' },
  active:    { color:'bg-blue-100 text-blue-700',     icon: CheckCircle, label:'Active' },
  completed: { color:'bg-gray-100 text-gray-600',     icon: CheckCircle, label:'Completed' },
  cancelled: { color:'bg-gray-100 text-gray-400',     icon: XCircle,     label:'Cancelled' },
};

const TX_STATUS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  disputed: 'bg-red-100 text-red-600',
  rejected: 'bg-gray-100 text-gray-500',
};

const PAYMENT_METHODS = ['bank_transfer','easypaisa','jazzcash','cash','cheque','other'];
const TX_TYPES = ['monthly_rent','deposit','purchase_payment','partial_payment','refund'];

export default function TransactionsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [selectedBooking, setSelected]  = useState<Booking | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [txLoading, setTxLoading]       = useState(false);
  const [payModal, setPayModal]         = useState(false);
  const [activeTab, setActiveTab]       = useState<'bookings'|'payments'>('bookings');

  // Payment form
  const [payForm, setPayForm] = useState({
    transactionType: 'monthly_rent', amount: '', currency: 'PKR',
    month: '', paymentMethod: 'bank_transfer', accountTitle: '',
    accountNumber: '', bankName: '', transactionRef: '', description: '', paidAt: '',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/auth/login?redirect=/transactions');
      } else if (user.role !== 'user') {
        router.replace(user.role === 'owner' ? '/dashboard/owner' : user.role === 'admin' ? '/dashboard/admin' : '/');
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== 'user') return;
    bookingAPI.getMine()
      .then(res => setBookings(res.data.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const loadTransactions = async (booking: Booking) => {
    setSelected(booking);
    setTxLoading(true);
    try {
      const res = await transactionAPI.getByBooking(booking._id);
      setTransactions(res.data.transactions || []);
    } catch { toast.error('Failed to load transactions'); }
    finally { setTxLoading(false); }
  };

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofFile) { toast.error('Payment receipt is required'); return; }
    if (!selectedBooking) return;
    setPaying(true);
    try {
      const fd = new FormData();
      Object.entries(payForm).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('proof', proofFile);
      const res = await transactionAPI.create(selectedBooking._id, fd);
      setTransactions(prev => [res.data.transaction, ...prev]);
      setPayModal(false);
      setPayForm({ transactionType:'monthly_rent', amount:'', currency:'PKR', month:'', paymentMethod:'bank_transfer', accountTitle:'', accountNumber:'', bankName:'', transactionRef:'', description:'', paidAt:'' });
      setProofFile(null);
      toast.success('Payment recorded! Waiting for owner verification.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally { setPaying(false); }
  };

  const approvedBookings = bookings.filter(b => ['approved','active'].includes(b.status));

  if (loading || isLoading) return (
    <AuthProvider><div className="min-h-screen flex flex-col"><Navbar/>
      <div className="flex-1 flex items-center justify-center"><div className="animate-spin w-10 h-10 border-4 border-[#131849] border-t-transparent rounded-full"/></div>
    </div></AuthProvider>
  );

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar/>
        <main className="flex-1 pt-20">
          <div className="bg-[#131849] py-10 px-4">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 mb-1">
                <Receipt size={18} className="text-yellow-400"/>
                <p className="text-yellow-400 text-sm font-semibold">My Records</p>
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Bookings & Transactions</h1>
              <p className="text-white/60 mt-1 text-sm">Track your property bookings and rent payments</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex border-b border-gray-200 mb-6 gap-1">
              {(['bookings','payments'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors ${activeTab===tab?'border-[#131849] text-[#131849]':'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab === 'bookings' ? `My Bookings (${bookings.length})` : 'Payment History'}
                </button>
              ))}
            </div>

            {/* BOOKINGS TAB */}
            {activeTab === 'bookings' && (
              bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><Receipt size={28} className="text-gray-300"/></div>
                  <h3 className="font-display text-xl font-bold text-gray-800 mb-2">No bookings yet</h3>
                  <p className="text-gray-400 text-sm mb-6">Browse properties and submit a booking application.</p>
                  <Link href="/properties" className="inline-flex items-center gap-2 bg-[#131849] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a2680] transition-all text-sm shadow-md">
                    Browse Properties <ArrowRight size={15}/>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => {
                    const statusInfo = BOOKING_STATUS[b.status];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <div key={b._id} className={`bg-white rounded-2xl border p-5 transition-all ${b.status==='approved'||b.status==='active'?'border-emerald-200':'border-gray-100'}`}>
                        <div className="flex flex-wrap items-start gap-4">
                          {/* Property */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              {b.property?.images?.[0] && <Image src={getFullImageUrl(b.property.images[0].url)} alt="" fill className="object-cover" sizes="64px" unoptimized={shouldUnoptimizeImage(b.property.images[0].url)}/>}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/properties/${b.property?._id}`} className="font-display font-bold text-[#131849] hover:text-yellow-500 transition-colors line-clamp-1 text-sm">
                                {b.property?.title}
                              </Link>
                              <p className="text-xs text-gray-400">{b.property?.location?.city}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {b.bookingType === 'rent' ? '🏠 Rent' : '🛒 Buy'} · PKR {b.agreedPrice.toLocaleString()}{b.bookingType==='rent'?'/mo':''}
                              </p>
                            </div>
                          </div>

                          {/* Status + actions */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                              <StatusIcon size={11}/>{statusInfo.label}
                            </span>
                            <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {/* Dates */}
                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                          <span>📅 Start: <strong>{new Date(b.startDate).toLocaleDateString('en-PK')}</strong></span>
                          {b.endDate && <span>📅 End: <strong>{new Date(b.endDate).toLocaleDateString('en-PK')}</strong></span>}
                          {b.depositAmount ? <span>💰 Deposit: <strong>PKR {b.depositAmount.toLocaleString()}</strong></span> : null}
                        </div>

                        {/* Owner notes */}
                        {b.ownerNote && (
                          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                            <span className="font-semibold">Owner note:</span> {b.ownerNote}
                          </div>
                        )}
                        {b.rejectedReason && (
                          <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                            <span className="font-semibold">Rejection reason:</span> {b.rejectedReason}
                          </div>
                        )}

                        {/* Actions */}
                        {['approved','active'].includes(b.status) && (
                          <div className="mt-4 flex gap-2 flex-wrap">
                            <button
                              onClick={() => { loadTransactions(b); setActiveTab('payments'); }}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-[#131849] text-white rounded-xl hover:bg-[#1a2680] transition-all">
                              <Receipt size={13}/>View Transactions
                            </button>
                            <button
                              onClick={() => { setSelected(b); loadTransactions(b); setPayModal(true); }}
                              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all">
                              <Upload size={13}/>Upload Payment
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* PAYMENTS TAB */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                {/* Select booking */}
                {approvedBookings.length > 0 && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm text-gray-700">Select a booking to view/upload payments</h3>
                      {selectedBooking && (
                        <button onClick={() => { setSelected(null); setPayModal(true); }}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all">
                          <Upload size={13}/>Upload New Payment
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {approvedBookings.map(b => (
                        <button key={b._id} onClick={() => loadTransactions(b)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${selectedBooking?._id===b._id?'bg-[#131849] text-white border-[#131849]':'bg-white text-gray-700 border-gray-200 hover:border-[#131849]'}`}>
                          {b.property?.title?.slice(0,25)}…
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!selectedBooking ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                    <Banknote size={36} className="mx-auto mb-3 opacity-30"/>
                    <p>Select an approved booking above to view transactions</p>
                  </div>
                ) : txLoading ? (
                  <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-[#131849] border-t-transparent rounded-full"/></div>
                ) : transactions.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <Banknote size={36} className="mx-auto mb-3 text-gray-300"/>
                    <h3 className="font-semibold text-gray-700 mb-2">No payments recorded yet</h3>
                    <p className="text-sm text-gray-400 mb-4">Upload your first payment receipt.</p>
                    <button onClick={() => setPayModal(true)} className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-600 transition-all">
                      <Upload size={14}/>Upload Payment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map(tx => (
                      <div key={tx._id} className="bg-white rounded-2xl border border-gray-100 p-5">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TX_STATUS[tx.status]}`}>{tx.status}</span>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{tx.transactionType.replace('_',' ')}</span>
                              {tx.month && <span className="text-xs text-gray-400">· {tx.month}</span>}
                            </div>
                            <p className="font-display font-bold text-xl text-[#131849]">
                              {tx.currency} {tx.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 mt-1 capitalize">{tx.paymentMethod.replace('_',' ')} · {new Date(tx.paidAt).toLocaleDateString('en-PK')}</p>
                            {tx.transactionRef && <p className="text-xs text-gray-400">Ref: <span className="font-mono">{tx.transactionRef}</span></p>}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <a href={tx.proofUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-[#131849] hover:text-yellow-500 transition-colors">
                              <Eye size={13}/>View Receipt
                            </a>
                          </div>
                        </div>
                        {tx.ownerNote && (
                          <div className={`mt-3 p-3 rounded-xl text-xs ${tx.status==='verified'?'bg-emerald-50 border border-emerald-200 text-emerald-700':'bg-red-50 border border-red-200 text-red-700'}`}>
                            <span className="font-semibold">Owner:</span> {tx.ownerNote}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer/>

        {/* ── PAYMENT UPLOAD MODAL ─────────────────────────────── */}
        {payModal && selectedBooking && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setPayModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100">
                <h3 className="font-display font-bold text-lg text-[#131849]">Upload Payment Proof</h3>
                <p className="text-xs text-gray-500 mt-1">{selectedBooking.property?.title}</p>
              </div>
              <form onSubmit={handlePaySubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Type *</label>
                    <select required value={payForm.transactionType} onChange={e => setPayForm({...payForm, transactionType: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]">
                      {TX_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace(/_/g,' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Month (if rent) *</label>
                    <input type="month" value={payForm.month} onChange={e => setPayForm({...payForm, month: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount (PKR) *</label>
                    <input required type="number" min="1" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})}
                      placeholder={String(selectedBooking.agreedPrice)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Method *</label>
                    <select required value={payForm.paymentMethod} onChange={e => setPayForm({...payForm, paymentMethod: e.target.value})}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]">
                      {PAYMENT_METHODS.map(m => <option key={m} value={m} className="capitalize">{m.replace('_',' ')}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Receiver Account Title</label>
                    <input value={payForm.accountTitle} onChange={e => setPayForm({...payForm, accountTitle: e.target.value})}
                      placeholder="Muhammad Owner"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account / IBAN</label>
                    <input value={payForm.accountNumber} onChange={e => setPayForm({...payForm, accountNumber: e.target.value})}
                      placeholder="PK36SCBL..."
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bank Name</label>
                    <input value={payForm.bankName} onChange={e => setPayForm({...payForm, bankName: e.target.value})}
                      placeholder="HBL / UBL / MCB…"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Transaction Ref / TID</label>
                    <input value={payForm.transactionRef} onChange={e => setPayForm({...payForm, transactionRef: e.target.value})}
                      placeholder="TXN123456"
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Date</label>
                  <input type="date" value={payForm.paidAt} onChange={e => setPayForm({...payForm, paidAt: e.target.value})}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Receipt / Screenshot *</label>
                  {proofFile ? (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle size={14} className="text-emerald-500"/>
                      <span className="text-xs text-emerald-700 flex-1 truncate">{proofFile.name}</span>
                      <button type="button" onClick={() => setProofFile(null)} className="text-gray-400 hover:text-red-500">✕</button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#131849] hover:bg-gray-50 transition-all">
                      <Upload size={18} className="text-gray-400 mb-1"/>
                      <p className="text-xs text-gray-600 font-medium">Upload receipt screenshot</p>
                      <p className="text-xs text-gray-400">JPG, PNG, PDF — max 5MB</p>
                      <input type="file" accept="image/*,.pdf" onChange={e => setProofFile(e.target.files?.[0]||null)} className="hidden"/>
                    </label>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPayModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                  <button type="submit" disabled={paying || !proofFile} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {paying ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</> : <><Upload size={14}/>Submit Payment</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthProvider>
  );
}
