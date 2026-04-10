'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Building2, SlidersHorizontal } from 'lucide-react';

interface Props {
  defaultValues?: { search?: string; type?: string; city?: string };
  onSearch?: (params: any) => void;
  compact?: boolean;
}

const TYPES = ['', 'apartment', 'house', 'villa', 'studio', 'commercial'];
const TYPE_LABELS: Record<string, string> = {
  '': 'All Types', apartment: 'Apartment', house: 'House',
  villa: 'Villa', studio: 'Studio', commercial: 'Commercial',
};

export default function SearchBar({ defaultValues = {}, onSearch, compact = false }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState(defaultValues.search || '');
  const [type, setType] = useState(defaultValues.type || '');
  const [city, setCity] = useState(defaultValues.city || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (type) params.set('type', type);
    if (city) params.set('city', city);
    if (onSearch) {
      onSearch({ search, type, city });
    } else {
      router.push(`/properties?${params.toString()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white/90 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl ${compact ? 'p-3' : 'p-4'}`}>
      <div className={`flex ${compact ? 'flex-col sm:flex-row' : 'flex-col md:flex-row'} gap-3`}>
        <div className="flex-1 relative">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City or neighborhood..."
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm transition-all"
          />
        </div>

        <div className="relative md:w-52">
          <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm cursor-pointer transition-all"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keyword..."
            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#131849]/20 focus:border-[#131849] text-sm transition-all"
          />
        </div>

        <button
          type="submit"
          className="bg-[#131849] text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#1a2680] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Search size={16} />
          Search
        </button>
      </div>
    </form>
  );
}
