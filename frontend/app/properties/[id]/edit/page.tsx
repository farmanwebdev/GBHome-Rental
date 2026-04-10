'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import AuthProvider from '@/components/ui/AuthProvider';
import { propertyAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Property } from '@/types';
import toast from 'react-hot-toast';

const TYPES       = ['apartment', 'house', 'villa', 'studio', 'commercial'];
const PRICE_TYPES = ['monthly', 'yearly', 'total'];

export default function EditPropertyPage() {
  const { id }               = useParams();
  const router               = useRouter();
  const { user, isLoading }  = useAuthStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [newImages, setNewImages]   = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [keepExisting, setKeepExisting] = useState(true);

  const [form, setForm] = useState({
    title: '', description: '', type: 'apartment', priceType: 'monthly', price: '',
    address: '', city: '', state: '', zipCode: '', country: 'USA',
    bedrooms: '1', bathrooms: '1', area: '',
    parking: false, furnished: false, petFriendly: false, pool: false, gym: false,
    availableFrom: '', availableTo: '',
  });

  // ── Auth guard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'owner' && user.role !== 'admin'))) {
      router.replace('/auth/login');
    }
  }, [user, isLoading, router]);

  // ── Load property ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    propertyAPI.getOne(id as string)
      .then((res) => {
        const p: Property = res.data.property;
        // Guard: only the owner or admin may edit
        if (p.owner._id !== user._id && user.role !== 'admin') {
          toast.error('Not authorized to edit this property');
          router.replace('/dashboard/owner');
          return;
        }
        setProperty(p);
        setForm({
          title:         p.title,
          description:   p.description,
          type:          p.type,
          priceType:     p.priceType,
          price:         String(p.price),
          address:       p.location.address,
          city:          p.location.city,
          state:         p.location.state || '',
          zipCode:       p.location.zipCode || '',
          country:       p.location.country || 'USA',
          bedrooms:      String(p.features.bedrooms),
          bathrooms:     String(p.features.bathrooms),
          area:          String(p.features.area || ''),
          parking:       p.features.parking    || false,
          furnished:     p.features.furnished   || false,
          petFriendly:   p.features.petFriendly || false,
          pool:          p.features.pool        || false,
          gym:           p.features.gym         || false,
          availableFrom: p.availableFrom ? new Date(p.availableFrom).toISOString().split('T')[0] : '',
          availableTo:   p.availableTo   ? new Date(p.availableTo).toISOString().split('T')[0]   : '',
        });
      })
      .catch(() => { toast.error('Property not found'); router.replace('/dashboard/owner'); })
      .finally(() => setLoading(false));
  }, [id, user, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...newImages, ...files].slice(0, 10);
    setNewImages(combined);
    setNewPreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removeNewImage = (i: number) => {
    setNewImages(prev  => prev.filter((_, idx) => idx !== i));
    setNewPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggle = (key: string) => setForm(p => ({ ...p, [key]: !p[key as keyof typeof p] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.city) { toast.error('Fill all required fields'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title',       form.title);
      fd.append('description', form.description);
      fd.append('type',        form.type);
      fd.append('price',       form.price);
      fd.append('priceType',   form.priceType);
      fd.append('location', JSON.stringify({
        address: form.address, city: form.city, state: form.state,
        zipCode: form.zipCode, country: form.country,
      }));
      fd.append('features', JSON.stringify({
        bedrooms:    Number(form.bedrooms),
        bathrooms:   Number(form.bathrooms),
        area:        Number(form.area) || undefined,
        parking:     form.parking,
        furnished:   form.furnished,
        petFriendly: form.petFriendly,
        pool:        form.pool,
        gym:         form.gym,
      }));
      if (form.availableFrom) fd.append('availableFrom', form.availableFrom);
      if (form.availableTo)   fd.append('availableTo',   form.availableTo);

      // Append new images only; existing kept server-side unless replaced
      newImages.forEach(img => fd.append('images', img));
      if (!keepExisting && newImages.length === 0) fd.append('clearImages', 'true');

      await propertyAPI.update(id as string, fd);
      toast.success('Property updated! Pending re-review if status changed.');
      router.push('/dashboard/owner');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || isLoading) return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col"><Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#131849] border-t-transparent rounded-full" />
        </div>
      </div>
    </AuthProvider>
  );

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <Link href="/dashboard/owner" className="p-2 rounded-xl border border-gray-200 hover:border-[#131849] text-gray-600 hover:text-[#131849] transition-all">
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold text-[#131849]">Edit Property</h1>
                <p className="text-sm text-gray-500">
                  Changes will reset status to <span className="font-semibold text-amber-600">pending</span> for re-review
                </p>
              </div>
            </div>

            {/* Status banner */}
            {property?.status === 'rejected' && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">This property was rejected</p>
                  {property.rejectedReason && (
                    <p className="text-sm text-red-600 mt-1">Reason: {property.rejectedReason}</p>
                  )}
                  <p className="text-xs text-red-500 mt-2">Fix the issues and save — it will be re-submitted for review.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Basic Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type *</label>
                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]">
                      {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                      <input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Per</label>
                      <select value={form.priceType} onChange={e => setForm({ ...form, priceType: e.target.value })}
                        className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]">
                        {PRICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Location</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                    <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                  </div>
                  {[
                    { key: 'city', label: 'City *', required: true },
                    { key: 'state', label: 'State', required: false },
                    { key: 'zipCode', label: 'ZIP Code', required: false },
                    { key: 'country', label: 'Country', required: false },
                  ].map(({ key, label, required }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                      <input
                        required={required}
                        value={form[key as keyof typeof form] as string}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Features & Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                  {[
                    { key: 'bedrooms', label: 'Bedrooms' },
                    { key: 'bathrooms', label: 'Bathrooms' },
                    { key: 'area', label: 'Area (sqft)' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                      <input type="number" min="0"
                        value={form[key as keyof typeof form] as string}
                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"
                      />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { key: 'parking', label: 'Parking' },
                    { key: 'furnished', label: 'Furnished' },
                    { key: 'petFriendly', label: 'Pet Friendly' },
                    { key: 'pool', label: 'Pool' },
                    { key: 'gym', label: 'Gym' },
                  ].map(({ key, label }) => (
                    <button key={key} type="button" onClick={() => toggle(key)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        form[key as keyof typeof form]
                          ? 'bg-[#131849] text-white border-[#131849]'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-[#131849]'
                      }`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Availability Dates</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Available From</label>
                    <input type="date" value={form.availableFrom} onChange={e => setForm({ ...form, availableFrom: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Available Until</label>
                    <input type="date" value={form.availableTo} onChange={e => setForm({ ...form, availableTo: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]" />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Property Images</h2>

                {/* Existing images */}
                {property?.images && property.images.length > 0 && (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-700">Current Images ({property.images.length})</p>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input type="checkbox" checked={keepExisting} onChange={e => setKeepExisting(e.target.checked)} className="accent-[#131849]" />
                        Keep existing images
                      </label>
                    </div>
                    <div className={`grid grid-cols-3 sm:grid-cols-5 gap-3 ${!keepExisting ? 'opacity-40' : ''}`}>
                      {property.images.map((img, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                          <Image src={img.url} alt="" fill className="object-cover" sizes="100px" unoptimized />
                          {i === 0 && <span className="absolute bottom-1 left-1 bg-[#131849] text-white text-xs px-2 py-0.5 rounded-full">Cover</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New image upload */}
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#131849] hover:bg-gray-50 transition-all mb-4">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-600">
                    {keepExisting ? 'Add more images' : 'Upload replacement images'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — up to 10 total</p>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>

                {newPreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {newPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                        <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Link href="/dashboard/owner"
                  className="flex-1 text-center py-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all text-sm">
                  Cancel
                </Link>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-[#131849] text-white font-bold py-4 rounded-xl hover:bg-[#1a2680] transition-all disabled:opacity-50 text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                  {saving
                    ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                    : <><CheckCircle size={16} />Save Changes</>
                  }
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
