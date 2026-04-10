'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare, ArrowRight, CheckCircle, Clock, Building2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';
import { inquiryAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Inquiry } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  new:     'bg-red-100 text-red-600',
  read:    'bg-gray-100 text-gray-500',
  replied: 'bg-emerald-100 text-emerald-600',
  closed:  'bg-gray-100 text-gray-400',
};

export default function InquiriesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/login?redirect=/inquiries');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    inquiryAPI.getMine()
      .then(res => setInquiries(res.data.inquiries || []))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pt-20">
          {/* Header */}
          <div className="bg-[#131849] py-10 px-4">
            <div className="max-w-4xl mx-auto sm:px-6">
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={20} className="text-yellow-400" />
                <p className="text-yellow-400 text-sm font-semibold">My Activity</p>
              </div>
              <h1 className="font-display text-3xl font-bold text-white">My Inquiries</h1>
              <p className="text-white/60 mt-1 text-sm">{inquiries.length} inquiry{inquiries.length !== 1 ? 'ies' : 'y'} sent</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : inquiries.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={28} className="text-gray-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-800 mb-2">No inquiries yet</h3>
                <p className="text-gray-400 text-sm mb-6">Browse properties and send an inquiry to an owner.</p>
                <Link href="/properties"
                  className="inline-flex items-center gap-2 bg-[#131849] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a2680] transition-all text-sm shadow-md">
                  Browse Properties <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {inquiries.map((inq) => (
                  <div key={inq._id}
                    className={`bg-white rounded-2xl border p-5 transition-all ${inq.status === 'replied' ? 'border-emerald-200' : 'border-gray-100'}`}>

                    {/* Property info */}
                    <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#131849]/10 rounded-xl flex items-center justify-center shrink-0">
                          <Building2 size={18} className="text-[#131849]" />
                        </div>
                        <div>
                          <Link href={`/properties/${inq.property?._id}`}
                            className="text-sm font-bold text-[#131849] hover:text-yellow-500 transition-colors line-clamp-1">
                            {inq.property?.title || 'Property'}
                          </Link>
                          <p className="text-xs text-gray-400">
                            {inq.property?.location?.city} · {new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[inq.status]}`}>
                        {inq.status}
                      </span>
                    </div>

                    {/* My message */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-3">
                      <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                        <Clock size={11} /> Your message
                      </p>
                      <p className="text-sm text-gray-700">{inq.message}</p>
                      {inq.phone && <p className="text-xs text-gray-400 mt-1">📞 {inq.phone}</p>}
                    </div>

                    {/* Owner reply */}
                    {inq.reply ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                          <CheckCircle size={11} /> Owner replied
                          {inq.repliedAt && (
                            <span className="font-normal text-emerald-400 ml-1">
                              · {new Date(inq.repliedAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-emerald-700">{inq.reply}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic flex items-center gap-1">
                        <Clock size={11} /> Waiting for owner's reply…
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
