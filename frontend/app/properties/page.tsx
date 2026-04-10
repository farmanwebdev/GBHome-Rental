'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, List, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import SearchBar from '@/components/property/SearchBar';
import AuthProvider from '@/components/ui/AuthProvider';
import { propertyAPI } from '@/lib/api';
import { Property } from '@/types';

const PRICE_RANGES = [
  { label: 'Any Price', min: '', max: '' },
  { label: 'Under $1,500', min: '', max: '1500' },
  { label: '$1,500 – $3,000', min: '1500', max: '3000' },
  { label: '$3,000 – $5,000', min: '3000', max: '5000' },
  { label: 'Over $5,000', min: '5000', max: '' },
];

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-views', label: 'Most Popular' },
];

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    type: searchParams.get('type') || '',
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'available',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: searchParams.get('bedrooms') || '',
    sort: searchParams.get('sort') || '-createdAt',
    page: Number(searchParams.get('page')) || 1,
  });

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const res = await propertyAPI.getAll(params);
      setProperties(res.data.properties);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key !== 'page' ? 1 : value }));
  };

  const handleSearch = (params: any) => {
    setFilters((prev) => ({ ...prev, ...params, page: 1 }));
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />

        {/* Header */}
        <div className="bg-[#131849] pt-28 pb-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-display text-4xl font-bold text-white mb-2">Browse Properties</h1>
            <p className="text-white/60 mb-8">{total > 0 ? `${total} properties found` : 'Search from our curated listings'}</p>
            <SearchBar defaultValues={filters} onSearch={handleSearch} compact />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar filters */}
            <div className={`lg:w-72 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 sticky top-24">
                <h3 className="font-display font-bold text-lg text-[#131849]">Filters</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Status</label>
                  <div className="space-y-2">
                    {['available', 'rented', 'sold', ''].map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="status" checked={filters.status === s} onChange={() => updateFilter('status', s)}
                          className="accent-[#131849]" />
                        <span className="text-sm text-gray-600 capitalize">{s || 'All'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Property Type</label>
                  <select value={filters.type} onChange={(e) => updateFilter('type', e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849]">
                    <option value="">All Types</option>
                    {['apartment','house','villa','studio','commercial'].map((t) => (
                      <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Price Range</label>
                  {PRICE_RANGES.map(({ label, min, max }) => (
                    <label key={label} className="flex items-center gap-2 cursor-pointer mb-2">
                      <input type="radio" name="price" checked={filters.minPrice === min && filters.maxPrice === max}
                        onChange={() => setFilters((p) => ({ ...p, minPrice: min, maxPrice: max, page: 1 }))}
                        className="accent-[#131849]" />
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Min. Bedrooms</label>
                  <div className="flex gap-2">
                    {['', '1', '2', '3', '4'].map((n) => (
                      <button key={n} onClick={() => updateFilter('bedrooms', n)}
                        className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${filters.bedrooms === n ? 'bg-[#131849] text-white border-[#131849]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#131849]'}`}>
                        {n || 'Any'}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setFilters({ city:'',type:'',search:'',status:'available',minPrice:'',maxPrice:'',bedrooms:'',sort:'-createdAt',page:1 })}
                  className="w-full py-2.5 border-2 border-gray-200 text-gray-500 rounded-xl text-sm font-semibold hover:border-red-300 hover:text-red-500 transition-all">
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-[#131849] transition-all">
                    <SlidersHorizontal size={15} /> Filters
                  </button>
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{total}</span> properties
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] bg-white">
                    {SORT_OPTIONS.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => setGridView(true)} className={`p-2.5 ${gridView ? 'bg-[#131849] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}><Grid3X3 size={16} /></button>
                    <button onClick={() => setGridView(false)} className={`p-2.5 ${!gridView ? 'bg-[#131849] text-white' : 'bg-white text-gray-400 hover:bg-gray-50'}`}><List size={16} /></button>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                      <div className="h-52 bg-gray-200" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : properties.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <Building2 size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="font-display text-xl font-bold text-gray-800 mb-2">No properties found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                <div className={`grid gap-6 ${gridView ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                  {properties.map((p) => <PropertyCard key={p._id} property={p} />)}
                </div>
              )}

              {/* Pagination */}
              {pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button onClick={() => updateFilter('page', filters.page - 1)} disabled={filters.page === 1}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-[#131849] hover:text-[#131849] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={18} />
                  </button>
                  {[...Array(pages)].map((_, i) => (
                    <button key={i} onClick={() => updateFilter('page', i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${filters.page === i + 1 ? 'bg-[#131849] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#131849] hover:text-[#131849]'}`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => updateFilter('page', filters.page + 1)} disabled={filters.page === pages}
                    className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:border-[#131849] hover:text-[#131849] disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}
