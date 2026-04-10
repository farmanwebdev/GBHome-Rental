'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle, XCircle, Clock, Eye, CreditCard,
  AlertCircle, Receipt, Banknote, MessageSquare
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';
import { ownerExtAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getFullImageUrl, shouldUnoptimizeImage } from '@/lib/imageUtils';
import { Booking, Transaction } from '@/types';
import toast from 'react-hot-toast';

const BOOKING_STATUS: Record<string, { color: string; label: string }> = {
  pending:   { color: 'bg-amber-100 text-amber-700',    label: 'Pending' },
  approved:  { color: 'bg-emerald-100 text-emerald-700',label: 'Approved' },
  rejected:  { color: 'bg-red-100 text-red-600',        label: 'Rejected' },
  active:    { color: 'bg-blue-100 text-blue-700',      label: 'Active' },
  completed: { color: 'bg-gray-100 text-gray-600',      label: 'Completed' },
  cancelled: { color: 'bg-gray-100 text-gray-400',      label: 'Cancelled' },
};

const TX_STATUS: Record<string, string> = {
  pending:  'bg-amber-100 text-amber-700',
  verified: 'bg-emerald-100 text-emerald-700',
  disputed: 'bg-red-100 text-red-600',
  rejected: 'bg-gray-100 text-gray-500',
};

export default function OwnerBookingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  const [bookings,      setBookings]      = useState<Booking[]>([]);
  const [transactions,  setTransactions]  = useState<Transaction[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState<'bookings' | 'payments'>('bookings');
  const [rejectModal,   setRejectModal]   = useState({ open: false, id: '', reason: '' });
  const [verifyModal,   setVerifyModal]   = useState({ open: false, id: '', status: 'verified', note: '' });

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'owner' && user.role !== 'admin'))) {
      router.replace('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    Promise.all([ownerExtAPI.getBookings(), ownerExtAPI.getTransactions()])
      .then(([b, t]) => {
        setBookings(b.data.bookings || []);
        setTransactions(t.data.transactions || []);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleApprove = async (id: string, note = '') => {
    try {
      await ownerExtAPI.approveBooking(id, { ownerNote: note });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'approved' as any } : b));
      toast.success('✅ Booking approved! Property marked as rented/sold.');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReject = async () => {
    try {
      await ownerExtAPI.rejectBooking(rejectModal.id, { reason: rejectModal.reason });
      setBookings(prev => prev.map(b => b._id === rejectModal.id ? { ...b, status: 'rejected' as any, rejectedReason: rejectModal.reason } : b));
      setRejectModal({ open: false, id: '', reason: '' });
      toast.success('Booking rejected');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleVerify = async () => {
    try {
      await ownerExtAPI.verifyTransaction(verifyModal.id, { status: verifyModal.status, note: verifyModal.note });
      setTransactions(prev => prev.map(t => t._id === verifyModal.id
        ? { ...t, status: verifyModal.status as any, ownerNote: verifyModal.note } : t
      ));
      setVerifyModal({ open: false, id: '', status: 'verified', note: '' });
      toast.success(verifyModal.status === 'verified' ? '✅ Payment verified!' : 'Payment disputed');
    } catch (err: any) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const pendingPayments = transactions.filter(t => t.status === 'pending').length;

  if (loading || isLoading) return (
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
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-yellow-400 text-sm font-semibold mb-1">Owner Panel</p>
                <h1 className="font-display text-3xl font-bold text-white">Bookings & Payments</h1>
                <p className="text-white/60 text-sm mt-1">Review applications and verify rent receipts</p>
              </div>
              <div className="flex gap-3">
                {pendingBookings > 0 && (
                  <div className="bg-amber-400 text-[#131849] font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                    <Clock size={15} />{pendingBookings} Pending Booking{pendingBookings > 1 ? 's' : ''}
                  </div>
                )}
                {pendingPayments > 0 && (
                  <div className="bg-emerald-400 text-white font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1.5">
                    <Receipt size={15} />{pendingPayments} Unverified Payment{pendingPayments > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6 gap-1">
              {([
                { key: 'bookings', label: `Booking Applications (${bookings.length})` },
                { key: 'payments', label: `Payment Receipts (${transactions.length})` },
              ] as const).map(({ key, label }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-[#131849] text-[#131849]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {label}
                  {key === 'bookings' && pendingBookings > 0 && (
                    <span className="ml-2 bg-amber-400 text-[#131849] text-xs font-bold rounded-full px-1.5 py-0.5">{pendingBookings}</span>
                  )}
                  {key === 'payments' && pendingPayments > 0 && (
                    <span className="ml-2 bg-emerald-400 text-white text-xs font-bold rounded-full px-1.5 py-0.5">{pendingPayments}</span>
                  )}
                </button>
              ))}
            </div>

            {/* ── BOOKINGS TAB ── */}
            {activeTab === 'bookings' && (
              bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
                  <Receipt size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No booking applications yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map(b => {
                    const st = BOOKING_STATUS[b.status];
                    return (
                      <div key={b._id} className={`bg-white rounded-2xl border p-5 ${b.status === 'pending' ? 'border-amber-200' : 'border-gray-100'}`}>
                        <div className="flex flex-wrap items-start gap-4 mb-4">
                          {/* Property */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                              {b.property?.images?.[0] && <Image src={getFullImageUrl(b.property.images[0].url)} alt="" fill className="object-cover" sizes="56px" unoptimized={shouldUnoptimizeImage(b.property.images[0].url)} />}
                            </div>
                            <div className="min-w-0">
                              <Link href={`/properties/${b.property?._id}`} className="font-display font-bold text-[#131849] hover:text-yellow-500 transition-colors line-clamp-1 text-sm">
                                {b.property?.title}
                              </Link>
                              <p className="text-xs text-gray-400">{b.property?.location?.city}</p>
                              <p className="text-xs text-gray-500 mt-0.5 capitalize">{b.bookingType === 'rent' ? '🏠 Rent' : '🛒 Buy'}</p>
                            </div>
                          </div>

                          {/* Applicant */}
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-800">{b.buyer?.name}</p>
                            <p className="text-xs text-gray-400 font-mono">{b.buyerCnic}</p>
                            <p className="text-xs text-gray-400">{b.buyer?.phone}</p>
                          </div>

                          {/* Status badge */}
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.color}`}>{st.label}</span>
                        </div>

                        {/* Terms */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-600 mb-4">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 mb-0.5">Agreed Price</p>
                            <p className="font-bold text-[#131849]">PKR {b.agreedPrice.toLocaleString()}{b.bookingType === 'rent' ? '/mo' : ''}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 mb-0.5">Deposit</p>
                            <p className="font-bold text-[#131849]">{b.depositAmount ? `PKR ${b.depositAmount.toLocaleString()}` : 'None'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 mb-0.5">Start Date</p>
                            <p className="font-bold text-[#131849]">{new Date(b.startDate).toLocaleDateString('en-PK')}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-gray-400 mb-0.5">Applied On</p>
                            <p className="font-bold text-[#131849]">{new Date(b.createdAt).toLocaleDateString('en-PK')}</p>
                          </div>
                        </div>

                        {/* Buyer note */}
                        {b.buyerNote && (
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs text-blue-700">
                            <span className="font-semibold">Applicant note:</span> {b.buyerNote}
                          </div>
                        )}

                        {/* CNIC proof links */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <a href={b.cnicFrontUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#131849] bg-[#131849]/5 px-3 py-1.5 rounded-xl hover:bg-[#131849]/10 transition-colors">
                            <CreditCard size={12} />CNIC Front
                          </a>
                          <a href={b.cnicBackUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs font-semibold text-[#131849] bg-[#131849]/5 px-3 py-1.5 rounded-xl hover:bg-[#131849]/10 transition-colors">
                            <CreditCard size={12} />CNIC Back
                          </a>
                          {b.additionalProofUrl && (
                            <a href={b.additionalProofUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-xl hover:bg-gray-200 transition-colors">
                              <Eye size={12} />Additional Proof
                            </a>
                          )}
                        </div>

                        {/* Actions */}
                        {b.status === 'pending' && (
                          <div className="flex gap-2 flex-wrap">
                            <button onClick={() => handleApprove(b._id)}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-all shadow-sm">
                              <CheckCircle size={14} />Approve Booking
                            </button>
                            <button onClick={() => setRejectModal({ open: true, id: b._id, reason: '' })}
                              className="flex items-center gap-1.5 px-4 py-2.5 bg-red-100 text-red-600 font-bold text-xs rounded-xl hover:bg-red-200 transition-all">
                              <XCircle size={14} />Reject
                            </button>
                          </div>
                        )}

                        {b.status === 'rejected' && b.rejectedReason && (
                          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                            <span className="font-semibold">Rejection reason:</span> {b.rejectedReason}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* ── PAYMENTS TAB ── */}
            {activeTab === 'payments' && (
              transactions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center text-gray-400">
                  <Banknote size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No rent payments uploaded yet.</p>
                  <p className="text-xs mt-2">Once a tenant uploads a payment receipt, you can verify or dispute it here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map(tx => (
                    <div key={tx._id} className={`bg-white rounded-2xl border p-5 ${tx.status === 'pending' ? 'border-emerald-200' : 'border-gray-100'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                            {tx.property?.images?.[0] && <Image src={getFullImageUrl(tx.property.images[0].url)} alt="" fill className="object-cover" sizes="48px" unoptimized={shouldUnoptimizeImage(tx.property.images[0].url)} />}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[#131849] line-clamp-1">{tx.property?.title}</p>
                            <p className="text-xs text-gray-400">{tx.payer?.name} · <span className="font-mono">{tx.payer?.cnic}</span></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-display font-bold text-xl text-[#131849]">{tx.currency} {tx.amount.toLocaleString()}</div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TX_STATUS[tx.status]}`}>{tx.status}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 mb-4">
                        <div><p className="text-gray-400">Type</p><p className="font-semibold capitalize">{tx.transactionType.replace('_', ' ')}</p></div>
                        <div><p className="text-gray-400">Month</p><p className="font-semibold">{tx.month || '—'}</p></div>
                        <div><p className="text-gray-400">Method</p><p className="font-semibold capitalize">{tx.paymentMethod.replace('_', ' ')}</p></div>
                        <div><p className="text-gray-400">Paid On</p><p className="font-semibold">{new Date(tx.paidAt).toLocaleDateString('en-PK')}</p></div>
                      </div>

                      {tx.transactionRef && (
                        <p className="text-xs text-gray-500 mb-3">Ref: <span className="font-mono font-semibold">{tx.transactionRef}</span></p>
                      )}

                      {tx.ownerNote && (
                        <div className={`text-xs rounded-xl p-3 mb-3 ${tx.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          <span className="font-semibold">Your note:</span> {tx.ownerNote}
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <a href={tx.proofUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-semibold text-[#131849] bg-[#131849]/5 px-3 py-2 rounded-xl hover:bg-[#131849]/10 transition-colors">
                          <Eye size={12} />View Receipt
                        </a>
                        {tx.status === 'pending' && (
                          <>
                            <button onClick={() => setVerifyModal({ open: true, id: tx._id, status: 'verified', note: '' })}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all">
                              <CheckCircle size={12} />Verify Payment
                            </button>
                            <button onClick={() => setVerifyModal({ open: true, id: tx._id, status: 'disputed', note: '' })}
                              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all">
                              <AlertCircle size={12} />Dispute
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </main>
        <Footer />

        {/* Reject booking modal */}
        {rejectModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setRejectModal({ open: false, id: '', reason: '' })}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><XCircle size={20} className="text-red-500" /></div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#131849]">Reject Application</h3>
                  <p className="text-xs text-gray-500">The applicant will see your reason.</p>
                </div>
              </div>
              <textarea rows={3} value={rejectModal.reason} onChange={e => setRejectModal({ ...rejectModal, reason: e.target.value })}
                placeholder="Reason for rejection…"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:border-red-400 mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setRejectModal({ open: false, id: '', reason: '' })} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleReject} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600">Confirm Rejection</button>
              </div>
            </div>
          </div>
        )}

        {/* Verify / dispute payment modal */}
        {verifyModal.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setVerifyModal({ open: false, id: '', status: 'verified', note: '' })}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${verifyModal.status === 'verified' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  {verifyModal.status === 'verified' ? <CheckCircle size={20} className="text-emerald-500" /> : <AlertCircle size={20} className="text-red-500" />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-[#131849]">
                    {verifyModal.status === 'verified' ? 'Verify Payment' : 'Dispute Payment'}
                  </h3>
                  <p className="text-xs text-gray-500">Add a note for the tenant (optional)</p>
                </div>
              </div>
              <textarea rows={2} value={verifyModal.note} onChange={e => setVerifyModal({ ...verifyModal, note: e.target.value })}
                placeholder={verifyModal.status === 'verified' ? 'Payment received, thank you!' : 'This amount does not match our agreement…'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setVerifyModal({ open: false, id: '', status: 'verified', note: '' })} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">Cancel</button>
                <button onClick={handleVerify}
                  className={`flex-1 py-2.5 text-white rounded-xl text-sm font-bold transition-colors ${verifyModal.status === 'verified' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                  {verifyModal.status === 'verified' ? 'Confirm Verified' : 'Confirm Dispute'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthProvider>
  );
}
