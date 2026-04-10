'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  MapPin, Bed, Bath, Square, Car, Sofa, PawPrint, Waves, Dumbbell,
  Calendar, Eye, MessageSquare, Heart, Share2, ArrowLeft, Phone, Mail,
  CheckCircle, Clock, XCircle, ShoppingCart, Home
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';
import { propertyAPI, inquiryAPI, favoriteAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getFullImageUrl, shouldUnoptimizeImage } from '@/lib/imageUtils';
import { Property } from '@/types';
import toast from 'react-hot-toast';

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending:  'bg-amber-100 text-amber-700 border-amber-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  rented:   'bg-blue-100 text-blue-700 border-blue-200',
  sold:     'bg-gray-100 text-gray-600 border-gray-200',
};
const STATUS_LABELS: Record<string, string> = {
  approved: 'Available', pending: 'Pending Review',
  rejected: 'Rejected',  rented: 'Rented', sold: 'Sold',
};

export default function PropertyDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user } = useAuthStore();
  const [property,  setProperty]  = useState<Property | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isFav,     setIsFav]     = useState(false);
  const [inquiry,   setInquiry]   = useState({ message: '', phone: '' });
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);

  useEffect(() => {
    propertyAPI.getOne(id as string)
      .then(res => {
        setProperty(res.data.property);
        setIsFav(user?.favorites?.includes(res.data.property._id) ?? false);
      })
      .catch(() => toast.error('Property not found'))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleFav = async () => {
    if (!user) { toast.error('Sign in to save favorites'); return; }
    try {
      await favoriteAPI.toggle(id as string);
      setIsFav(!isFav);
      toast.success(isFav ? 'Removed from favorites' : 'Saved to favorites');
    } catch { toast.error('Failed'); }
  };

  const handleInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { router.push(`/auth/login?redirect=/properties/${id}`); return; }
    setSending(true);
    try {
      await inquiryAPI.send(id as string, inquiry);
      setSent(true);
      toast.success('Inquiry sent! The owner will contact you shortly.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send inquiry');
    } finally { setSending(false); }
  };

  if (loading) return (
    <AuthProvider><div className="min-h-screen flex flex-col bg-gray-50"><Navbar />
      <div className="flex-1 flex items-center justify-center pt-24">
        <div className="animate-spin w-10 h-10 border-4 border-[#131849] border-t-transparent rounded-full" />
      </div>
    </div></AuthProvider>
  );

  if (!property) return (
    <AuthProvider><div className="min-h-screen flex flex-col bg-gray-50"><Navbar />
      <div className="flex-1 flex items-center justify-center pt-24 text-center px-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-gray-800 mb-4">Property not found</h2>
          <Link href="/properties" className="inline-flex items-center gap-2 bg-[#131849] text-white px-6 py-3 rounded-xl font-semibold">
            <ArrowLeft size={16} />Back to listings
          </Link>
        </div>
      </div>
    </div></AuthProvider>
  );

  const isAvailable = property.status === 'approved';
  const isLocked    = property.status === 'sold' || property.status === 'rented';
  const isInactive  = property.status === 'pending' || property.status === 'rejected';
  const images = property.images?.length
    ? property.images.map(img => ({ ...img, url: getFullImageUrl(img.url) }))
    : [{ url: getFullImageUrl(), publicId: '' }];

  const amenities = [
    { key: 'parking',    icon: Car,      label: 'Parking' },
    { key: 'furnished',  icon: Sofa,     label: 'Furnished' },
    { key: 'petFriendly',icon: PawPrint, label: 'Pet Friendly' },
    { key: 'pool',       icon: Waves,    label: 'Pool' },
    { key: 'gym',        icon: Dumbbell, label: 'Gym' },
  ].filter(a => property.features[a.key as keyof typeof property.features]);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pt-20">

          {/* Breadcrumb */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link href="/" className="hover:text-[#131849]">Home</Link>
              <span>/</span>
              <Link href="/properties" className="hover:text-[#131849]">Properties</Link>
              <span>/</span>
              <span className="text-gray-800 font-medium truncate">{property.title}</span>
            </div>
          </div>

          {/* Image gallery */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 rounded-2xl overflow-hidden">
              <div className="md:col-span-2 relative h-72 md:h-[480px]">
                <Image
                  src={images[activeImg]?.url} alt={property.title} fill
                  className="object-cover"
                  sizes="(max-width:768px) 100vw, 66vw"
                  unoptimized={shouldUnoptimizeImage(images[activeImg]?.url)}
                />
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold border ${STATUS_STYLES[property.status]}`}>
                  {STATUS_LABELS[property.status]}
                </div>
              </div>
              <div className="hidden md:grid grid-rows-3 gap-3 h-[480px]">
                {images.slice(1, 4).map((img, i) => (
                  <div key={i} onClick={() => setActiveImg(i + 1)} className="relative cursor-pointer overflow-hidden rounded-xl hover:opacity-90 transition-opacity">
                    <Image src={img.url} alt="" fill className="object-cover" sizes="33vw" unoptimized={shouldUnoptimizeImage(img.url)} />
                  </div>
                ))}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 transition-all ${activeImg === i ? 'ring-2 ring-[#131849] ring-offset-1' : 'opacity-60 hover:opacity-100'}`}>
                    <Image src={img.url} alt="" fill className="object-cover" sizes="64px" unoptimized={shouldUnoptimizeImage(img.url)} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status banners */}
          {property.status === 'rejected' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Property Rejected</p>
                  {property.rejectedReason && <p className="text-sm text-red-600 mt-1">{property.rejectedReason}</p>}
                </div>
              </div>
            </div>
          )}
          {property.status === 'pending' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                <Clock size={16} className="text-amber-500 shrink-0" />
                <p className="text-sm text-amber-700">This property is <strong>pending admin review</strong> and not yet publicly visible.</p>
              </div>
            </div>
          )}

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* ── LEFT COLUMN ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* Title + price + actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full capitalize">{property.type}</span>
                      <h1 className="font-display text-3xl font-bold text-[#131849] mt-2">{property.title}</h1>
                      <div className="flex items-center gap-1.5 text-gray-500 mt-2 text-sm">
                        <MapPin size={14} />
                        <span>{property.location.address}, {property.location.city}{property.location.state ? `, ${property.location.state}` : ''}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl font-bold text-[#131849]">
                        PKR {property.price.toLocaleString()}
                        {property.priceType === 'monthly' && <span className="text-base text-gray-400 font-sans font-normal">/mo</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button onClick={handleFav}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${isFav ? 'bg-red-50 border-red-200 text-red-500' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'}`}>
                      <Heart size={15} fill={isFav ? 'currentColor' : 'none'} />{isFav ? 'Saved' : 'Save'}
                    </button>
                    <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-600 text-sm font-semibold hover:border-[#131849] transition-all">
                      <Share2 size={15} />Share
                    </button>
                    <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Eye size={12} />{property.views} views</span>
                      <span className="flex items-center gap-1"><MessageSquare size={12} />{property.inquiryCount} inquiries</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-display text-xl font-bold text-[#131849] mb-5">Property Details</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { icon: Bed,      label: 'Bedrooms',   value: property.features.bedrooms },
                      { icon: Bath,     label: 'Bathrooms',  value: property.features.bathrooms },
                      { icon: Square,   label: 'Area (sqft)',value: property.features.area?.toLocaleString() || '—' },
                      { icon: Calendar, label: 'Listed',     value: new Date(property.createdAt).toLocaleDateString('en-PK', { month: 'short', year: 'numeric' }) },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                        <Icon size={20} className="mx-auto mb-2 text-[#131849]" />
                        <div className="font-display font-bold text-lg text-[#131849]">{value}</div>
                        <div className="text-xs text-gray-500">{label}</div>
                      </div>
                    ))}
                  </div>
                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {amenities.map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-semibold">
                          <Icon size={12} />{label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-display text-xl font-bold text-[#131849] mb-4">Description</h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{property.description}</p>
                  {(property.availableFrom || property.availableTo) && (
                    <div className="mt-4 flex gap-4 text-sm flex-wrap">
                      {property.availableFrom && <div><span className="text-gray-500">Available from: </span><span className="font-semibold">{new Date(property.availableFrom).toLocaleDateString()}</span></div>}
                      {property.availableTo   && <div><span className="text-gray-500">Until: </span><span className="font-semibold">{new Date(property.availableTo).toLocaleDateString()}</span></div>}
                    </div>
                  )}
                </div>
              </div>

              {/* ── RIGHT SIDEBAR ── */}
              <div className="space-y-5">

                {/* Book Now CTA — main action */}
                {isAvailable && (
                  <div className="bg-gradient-to-br from-[#131849] to-[#1a2680] rounded-2xl p-6 text-white">
                    <h3 className="font-display font-bold text-xl mb-2">Ready to Move In?</h3>
                    <p className="text-white/70 text-sm mb-5">Submit a booking application with your CNIC proof. The owner will review and respond within 1-3 days.</p>
                    <div className="space-y-3">
                      <Link href={user ? `/properties/${id}/book?type=rent` : `/auth/login?redirect=/properties/${id}/book`}
                        className="flex items-center justify-center gap-2 w-full bg-yellow-400 text-[#131849] font-bold py-3.5 rounded-xl hover:bg-yellow-500 transition-all text-sm shadow-lg">
                        <Home size={16} />Rent This Property
                      </Link>
                      <Link href={user ? `/properties/${id}/book?type=buy` : `/auth/login?redirect=/properties/${id}/book`}
                        className="flex items-center justify-center gap-2 w-full bg-white/10 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/20 transition-all text-sm">
                        <ShoppingCart size={16} />Purchase / Buy
                      </Link>
                    </div>
                    <p className="text-white/40 text-xs text-center mt-3">🔒 CNIC verification required</p>
                  </div>
                )}

                {isLocked && (
                  <div className="bg-gray-100 rounded-2xl p-5 text-center border border-gray-200">
                    <div className="text-3xl mb-2">{property.status === 'sold' ? '🏷️' : '🔑'}</div>
                    <p className="font-semibold text-gray-700 capitalize">Property {property.status}</p>
                    <p className="text-xs text-gray-400 mt-1">This property is no longer available for booking.</p>
                  </div>
                )}

                {/* Owner card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-display font-bold text-base text-[#131849] mb-4">Listed by</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#131849] rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {property.owner?.name?.[0]?.toUpperCase() || 'O'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{property.owner?.name}</div>
                      <div className="text-xs text-gray-500">Property Owner</div>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {property.owner?.phone && (
                      <a href={`tel:${property.owner.phone}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#131849] transition-colors">
                        <Phone size={14} className="text-[#131849]" />{property.owner.phone}
                      </a>
                    )}
                    <a href={`mailto:${property.owner?.email}`} className="flex items-center gap-3 text-sm text-gray-600 hover:text-[#131849] transition-colors">
                      <Mail size={14} className="text-[#131849]" />{property.owner?.email}
                    </a>
                  </div>
                </div>

                {/* Quick inquiry form */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="font-display font-bold text-base text-[#131849] mb-4">
                    {isLocked || isInactive ? 'Inquiries Unavailable' : 'Quick Inquiry'}
                  </h3>
                  {isLocked || isInactive ? (
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <p className="text-gray-500 text-sm">This property is <strong className="capitalize">{STATUS_LABELS[property.status]}</strong>.</p>
                    </div>
                  ) : sent ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                      <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                      <p className="text-emerald-700 font-semibold text-sm">Inquiry sent!</p>
                      <p className="text-emerald-600 text-xs mt-1">The owner will contact you soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleInquiry} className="space-y-3">
                      <textarea required rows={3} value={inquiry.message}
                        onChange={e => setInquiry({ ...inquiry, message: e.target.value })}
                        placeholder="Hi, I'm interested in this property…"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                      <input type="tel" value={inquiry.phone}
                        onChange={e => setInquiry({ ...inquiry, phone: e.target.value })}
                        placeholder="Your phone (optional)"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                      <button type="submit" disabled={sending}
                        className="w-full bg-[#131849] text-white font-bold py-3 rounded-xl hover:bg-[#1a2680] transition-all disabled:opacity-50 text-sm">
                        {sending ? 'Sending…' : user ? 'Send Inquiry' : 'Sign In to Inquire'}
                      </button>
                    </form>
                  )}
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
