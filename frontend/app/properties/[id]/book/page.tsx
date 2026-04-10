'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, X, CreditCard, CheckCircle, AlertCircle, Info, Home, ShoppingCart } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import AuthProvider from '@/components/ui/AuthProvider';
import { propertyAPI, bookingAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getFullImageUrl, shouldUnoptimizeImage } from '@/lib/imageUtils';
import { Property } from '@/types';
import toast from 'react-hot-toast';

export default function BookPropertyPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user, isLoading } = useAuthStore();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep]         = useState(1); // 1=details, 2=docs, 3=confirm

  // Form state
  const [form, setForm] = useState({
    bookingType:   'rent',
    agreedPrice:   '',
    depositAmount: '',
    startDate:     '',
    endDate:       '',
    buyerNote:     '',
  });
  const [cnicFront, setCnicFront]   = useState<File | null>(null);
  const [cnicBack,  setCnicBack]    = useState<File | null>(null);
  const [additionalProof, setAdditional] = useState<File | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/auth/login?redirect=/properties/${id}/book`);
    }
  }, [user, isLoading, router, id]);

  const isAuthorizedBuyer = !!user && user.role === 'user';

  useEffect(() => {
    if (!user) return;
    propertyAPI.getOne(id as string)
      .then(res => { setProperty(res.data.property); setForm(f => ({ ...f, agreedPrice: String(res.data.property.price) })); })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleFile = (setter: (f: File | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) { toast.error('File must be under 5MB'); return; }
    setter(file);
  };

  const FileUpload = ({ label, file, setter, required = true }: {
    label: string; file: File | null; setter: (f: File | null) => void; required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {file ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <span className="text-sm text-emerald-700 flex-1 truncate">{file.name}</span>
          <button type="button" onClick={() => setter(null)} className="text-gray-400 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#131849] hover:bg-gray-50 transition-all">
          <Upload size={20} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 font-medium">Click to upload</p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, PDF — max 5MB</p>
          <input type="file" accept="image/*,.pdf" onChange={handleFile(setter)} className="hidden" />
        </label>
      )}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cnicFront || !cnicBack) { toast.error('Both CNIC front and back images are required'); return; }
    if (!form.startDate)         { toast.error('Start date is required'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('bookingType',   form.bookingType);
      fd.append('agreedPrice',   form.agreedPrice);
      fd.append('depositAmount', form.depositAmount || '0');
      fd.append('startDate',     form.startDate);
      if (form.endDate)   fd.append('endDate',   form.endDate);
      if (form.buyerNote) fd.append('buyerNote', form.buyerNote);
      fd.append('cnicFront', cnicFront);
      fd.append('cnicBack',  cnicBack);
      if (additionalProof) fd.append('additionalProof', additionalProof);

      await bookingAPI.create(id as string, fd);
      toast.success('Booking request submitted! The owner will review and contact you.');
      router.push('/transactions');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || isLoading) return (
    <AuthProvider><div className="min-h-screen flex flex-col bg-gray-50"><Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-[#131849] border-t-transparent rounded-full" />
      </div>
    </div></AuthProvider>
  );

  if (!property) return null;

  if (!isAuthorizedBuyer) {
    return (
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-1 pt-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto py-24 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-600 mx-auto mb-6">
                <AlertCircle size={32} />
              </div>
              <h1 className="font-display text-3xl font-bold text-[#131849] mb-4">Booking restricted</h1>
              <p className="text-gray-600 mb-6">Only tenant/buyer accounts may submit property booking applications. Please sign in with a buyer account or contact support if you think this is an error.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/auth/register" className="px-6 py-3 rounded-xl bg-[#131849] text-white font-semibold hover:bg-[#1a2680] transition">Register as Buyer</Link>
                <Link href={user?.role === 'owner' ? '/dashboard/owner' : user?.role === 'admin' ? '/dashboard/admin' : '/'} className="px-6 py-3 rounded-xl border border-[#131849] text-[#131849] font-semibold hover:bg-gray-100 transition">Go Back</Link>
              </div>
            </div>
          </main>
        </div>
      </AuthProvider>
    );
  }

  const STEPS = ['Booking Details', 'Upload Documents', 'Confirm & Submit'];

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Link href={`/properties/${id}`} className="p-2 rounded-xl border border-gray-200 hover:border-[#131849] text-gray-600 hover:text-[#131849] transition-all">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold text-[#131849]">Book Property</h1>
                <p className="text-sm text-gray-500">{property.title}</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-3 mb-8">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-all ${
                    step > i+1 ? 'bg-emerald-500 text-white' : step === i+1 ? 'bg-[#131849] text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > i+1 ? <CheckCircle size={16} /> : i+1}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${step === i+1 ? 'text-[#131849]' : 'text-gray-400'}`}>{s}</span>
                  {i < 2 && <div className={`h-0.5 flex-1 hidden sm:block ${step > i+1 ? 'bg-emerald-300' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property summary sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
                  <div className="relative h-40 rounded-xl overflow-hidden mb-4">
                    <Image src={getFullImageUrl(property.images?.[0]?.url)} alt={property.title} fill className="object-cover" sizes="300px" unoptimized={shouldUnoptimizeImage(property.images?.[0]?.url)} />
                  </div>
                  <h3 className="font-display font-bold text-[#131849] mb-1 line-clamp-2">{property.title}</h3>
                  <p className="text-xs text-gray-500 mb-3">{property.location.address}, {property.location.city}</p>
                  <div className="bg-[#131849]/5 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-1">Listed Price</p>
                    <p className="font-display font-bold text-[#131849] text-xl">
                      PKR {property.price.toLocaleString()}
                      {property.priceType === 'monthly' && <span className="text-sm text-gray-400 font-sans font-normal">/mo</span>}
                    </p>
                  </div>
                  <div className="mt-3 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="font-semibold mb-1">📋 Required Documents</p>
                    <ul className="space-y-0.5 text-amber-700">
                      <li>• CNIC Front image</li>
                      <li>• CNIC Back image</li>
                      <li>• Optional: Salary slip / proof</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Main form */}
              <div className="lg:col-span-2">
                <form onSubmit={handleSubmit} className="space-y-6">

                  {/* STEP 1: Booking Details */}
                  {step === 1 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Booking Details</h2>

                      {/* Type */}
                      <div className="mb-5">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">I want to</label>
                        <div className="grid grid-cols-2 gap-3">
                          {[{ val:'rent', icon: Home, label:'Rent', sub:'Monthly payments' },
                            { val:'buy',  icon: ShoppingCart, label:'Buy', sub:'Full purchase' }].map(({ val, icon: Icon, label, sub }) => (
                            <button key={val} type="button" onClick={() => setForm({ ...form, bookingType: val })}
                              className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all text-left ${form.bookingType===val ? 'bg-[#131849] border-[#131849] text-white' : 'bg-white border-gray-200 text-gray-700 hover:border-[#131849]'}`}>
                              <Icon size={20} />
                              <div>
                                <p className="font-semibold text-sm">{label}</p>
                                <p className={`text-xs ${form.bookingType===val?'text-white/60':'text-gray-400'}`}>{sub}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Agreed Price (PKR) *</label>
                          <input required type="number" min="0" value={form.agreedPrice} onChange={e => setForm({ ...form, agreedPrice: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Security Deposit (PKR)</label>
                          <input type="number" min="0" value={form.depositAmount} onChange={e => setForm({ ...form, depositAmount: e.target.value })}
                            placeholder="0"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {form.bookingType === 'buy' ? 'Purchase Date' : 'Move-in Date'} *
                          </label>
                          <input required type="date" min={new Date().toISOString().split('T')[0]} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                        </div>
                        {form.bookingType === 'rent' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Move-out Date <span className="text-gray-400 font-normal">(optional)</span></label>
                            <input type="date" min={form.startDate} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Message to Owner</label>
                        <textarea rows={3} value={form.buyerNote} onChange={e => setForm({ ...form, buyerNote: e.target.value })}
                          placeholder="Introduce yourself, any special requirements…"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                      </div>

                      <button type="button" onClick={() => setStep(2)}
                        disabled={!form.agreedPrice || !form.startDate}
                        className="w-full mt-5 bg-[#131849] text-white font-bold py-3.5 rounded-xl hover:bg-[#1a2680] transition-all disabled:opacity-50 text-sm shadow-md">
                        Next: Upload Documents →
                      </button>
                    </div>
                  )}

                  {/* STEP 2: Documents */}
                  {step === 2 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard size={18} className="text-[#131849]" />
                        <h2 className="font-display font-bold text-lg text-[#131849]">Identity Verification</h2>
                      </div>
                      <p className="text-sm text-gray-500 mb-6">Upload clear photos of your CNIC as proof of identity. Your CNIC registered at login: <strong className="font-mono text-[#131849]">{user?.cnic}</strong></p>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-xs text-blue-700 space-y-1">
                          <p className="font-semibold">Document Requirements:</p>
                          <p>• Clear, legible photos — all text must be readable</p>
                          <p>• Both sides of your original CNIC (not a photocopy)</p>
                          <p>• JPG, PNG, or PDF format, max 5MB each</p>
                          <p>• Documents are encrypted and only shared with the property owner</p>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <FileUpload label="CNIC Front Side" file={cnicFront} setter={setCnicFront} />
                        <FileUpload label="CNIC Back Side"  file={cnicBack}  setter={setCnicBack} />
                        <FileUpload label="Additional Proof (Salary slip, employment letter, etc.)" file={additionalProof} setter={setAdditional} required={false} />
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">← Back</button>
                        <button type="button" onClick={() => setStep(3)} disabled={!cnicFront || !cnicBack}
                          className="flex-1 py-3 bg-[#131849] text-white font-bold rounded-xl hover:bg-[#1a2680] disabled:opacity-50 text-sm shadow-md">
                          Review & Submit →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Confirm */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="bg-white rounded-2xl border border-gray-100 p-6">
                        <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Review Your Application</h2>

                        <div className="space-y-3 text-sm">
                          {[
                            ['Property', property.title],
                            ['Booking Type', form.bookingType === 'rent' ? '🏠 Rent' : '🛒 Purchase'],
                            ['Agreed Price', `PKR ${Number(form.agreedPrice).toLocaleString()}${form.bookingType==='rent'?'/month':''}`],
                            ['Security Deposit', form.depositAmount ? `PKR ${Number(form.depositAmount).toLocaleString()}` : 'None'],
                            ['Start Date', form.startDate ? new Date(form.startDate).toLocaleDateString('en-PK', { day:'2-digit', month:'long', year:'numeric' }) : '—'],
                            ...(form.endDate ? [['End Date', new Date(form.endDate).toLocaleDateString('en-PK', { day:'2-digit', month:'long', year:'numeric' })]] : []),
                            ['Your CNIC', user?.cnic || '—'],
                            ['CNIC Front', cnicFront ? `✅ ${cnicFront.name}` : '—'],
                            ['CNIC Back',  cnicBack  ? `✅ ${cnicBack.name}`  : '—'],
                          ].map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-4 py-2 border-b border-gray-50 last:border-0">
                              <span className="text-gray-500 shrink-0">{k}</span>
                              <span className="font-semibold text-gray-800 text-right">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
                        <p className="font-bold mb-1">📝 What happens next?</p>
                        <ol className="space-y-1 list-decimal list-inside">
                          <li>Owner reviews your application and CNIC documents</li>
                          <li>Owner approves or rejects within 1-3 business days</li>
                          <li>If approved, you'll see it in your bookings with payment instructions</li>
                          <li>Upload monthly rent receipts in the Transactions section</li>
                        </ol>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep(2)} className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50">← Back</button>
                        <button type="submit" disabled={submitting}
                          className="flex-1 bg-[#131849] text-white font-bold py-4 rounded-xl hover:bg-[#1a2680] transition-all disabled:opacity-50 text-sm shadow-lg flex items-center justify-center gap-2">
                          {submitting
                            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Submitting…</>
                            : <><CheckCircle size={16}/>Submit Application</>
                          }
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
