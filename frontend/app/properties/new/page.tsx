'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Upload, X, Plus } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import AuthProvider from '@/components/ui/AuthProvider';
import { propertyAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import toast from 'react-hot-toast';

const TYPES = ['apartment','house','villa','studio','commercial'];
const PRICE_TYPES = ['monthly','yearly','total'];

export default function NewPropertyPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    title:'', description:'', type:'apartment', priceType:'monthly', price:'',
    address:'', city:'', state:'', zipCode:'', country:'USA',
    bedrooms:'1', bathrooms:'1', area:'', parking:false, furnished:false,
    petFriendly:false, pool:false, gym:false, availableFrom:'', availableTo:'',
  });

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'owner' && user.role !== 'admin'))) {
      router.replace('/auth/login');
    }
  }, [user, isLoading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...images, ...files].slice(0, 10);
    setImages(newFiles);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPreviews(newPreviews);
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.price || !form.city) { toast.error('Fill required fields'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('type', form.type);
      fd.append('price', form.price);
      fd.append('priceType', form.priceType);
      fd.append('location', JSON.stringify({ address:form.address, city:form.city, state:form.state, zipCode:form.zipCode, country:form.country }));
      fd.append('features', JSON.stringify({ bedrooms:Number(form.bedrooms), bathrooms:Number(form.bathrooms), area:Number(form.area)||undefined, parking:form.parking, furnished:form.furnished, petFriendly:form.petFriendly, pool:form.pool, gym:form.gym }));
      if (form.availableFrom) fd.append('availableFrom', form.availableFrom);
      if (form.availableTo) fd.append('availableTo', form.availableTo);
      images.forEach(img => fd.append('images', img));
      await propertyAPI.create(fd);
      toast.success('Property listed successfully!');
      router.push('/dashboard/owner');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create property');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (key: string) => setForm(p => ({ ...p, [key]: !p[key as keyof typeof p] }));

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-20 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-3 mb-8">
              <Link href="/dashboard/owner" className="p-2 rounded-xl border border-gray-200 hover:border-[#131849] text-gray-600 hover:text-[#131849] transition-all">
                <ArrowLeft size={18}/>
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold text-[#131849]">List a New Property</h1>
                <p className="text-sm text-gray-500">Fill out the details to publish your listing</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Basic Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Property Title *</label>
                    <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="e.g. Luxury Beach Villa" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type *</label>
                    <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]">
                      {TYPES.map(t=><option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                      <input required type="number" min="0" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="2500" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                    </div>
                    <div className="w-32">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Per</label>
                      <select value={form.priceType} onChange={e=>setForm({...form,priceType:e.target.value})} className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]">
                        {PRICE_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea rows={4} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Describe the property..." className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Location</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address</label>
                    <input value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="123 Main Street" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input required value={form.city} onChange={e=>setForm({...form,city:e.target.value})} placeholder="New York" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                    <input value={form.state} onChange={e=>setForm({...form,state:e.target.value})} placeholder="NY" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code</label>
                    <input value={form.zipCode} onChange={e=>setForm({...form,zipCode:e.target.value})} placeholder="10001" className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                    <input value={form.country} onChange={e=>setForm({...form,country:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Features & Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
                  {[{key:'bedrooms',label:'Bedrooms'},{key:'bathrooms',label:'Bathrooms'},{key:'area',label:'Area (sqft)'}].map(({key,label})=>(
                    <div key={key}>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                      <input type="number" min="0" value={form[key as keyof typeof form] as string} onChange={e=>setForm({...form,[key]:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[{key:'parking',label:'Parking'},{key:'furnished',label:'Furnished'},{key:'petFriendly',label:'Pet Friendly'},{key:'pool',label:'Pool'},{key:'gym',label:'Gym'}].map(({key,label})=>(
                    <button key={key} type="button" onClick={()=>toggle(key)}
                      className={`py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form[key as keyof typeof form] ? 'bg-[#131849] text-white border-[#131849]' : 'bg-white text-gray-500 border-gray-200 hover:border-[#131849]'}`}>
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
                    <input type="date" value={form.availableFrom} onChange={e=>setForm({...form,availableFrom:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Available Until</label>
                    <input type="date" value={form.availableTo} onChange={e=>setForm({...form,availableTo:e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]"/>
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-display font-bold text-lg text-[#131849] mb-5">Property Images</h2>
                <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#131849] hover:bg-gray-50 transition-all mb-4">
                  <Upload size={28} className="text-gray-400 mb-2"/>
                  <p className="text-sm font-semibold text-gray-600">Click to upload images</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — max 5MB each, up to 10 images</p>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden"/>
                </label>
                {previews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {previews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover"/>
                        <button type="button" onClick={()=>removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={12}/>
                        </button>
                        {i === 0 && <span className="absolute bottom-1 left-1 bg-[#131849] text-white text-xs px-2 py-0.5 rounded-full">Cover</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Link href="/dashboard/owner" className="flex-1 text-center py-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:border-gray-400 transition-all text-sm">Cancel</Link>
                <button type="submit" disabled={loading} className="flex-1 bg-[#131849] text-white font-bold py-4 rounded-xl hover:bg-[#1a2680] transition-all disabled:opacity-50 text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">
                  {loading ? 'Publishing…' : 'Publish Property'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
