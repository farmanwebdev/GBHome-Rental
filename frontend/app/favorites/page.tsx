'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, Building2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import AuthProvider from '@/components/ui/AuthProvider';
import { favoriteAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { Property } from '@/types';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) router.replace('/auth/login?redirect=/favorites');
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user) return;
    favoriteAPI.getAll()
      .then((res) => setFavorites(res.data.favorites || []))
      .finally(() => setLoading(false));
  }, [user]);

  const handleRemove = (id: string) => {
    setFavorites(prev => prev.filter(p => p._id !== id));
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1 pt-20">
          <div className="bg-[#131849] py-10 px-4">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 mb-1">
                <Heart size={22} className="text-red-400" fill="currentColor" />
                <p className="text-yellow-400 text-sm font-semibold">My Collection</p>
              </div>
              <h1 className="font-display text-3xl font-bold text-white">Saved Properties</h1>
              <p className="text-white/60 mt-1 text-sm">{favorites.length} saved listing{favorites.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-52 bg-gray-200"/><div className="p-5 space-y-3"><div className="h-4 bg-gray-200 rounded w-3/4"/><div className="h-3 bg-gray-200 rounded w-1/2"/></div>
                  </div>
                ))}
              </div>
            ) : favorites.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart size={28} className="text-red-300" />
                </div>
                <h3 className="font-display text-xl font-bold text-gray-800 mb-2">No saved properties yet</h3>
                <p className="text-gray-400 text-sm mb-6">Browse listings and save your favorites for easy access later.</p>
                <Link href="/properties" className="inline-flex items-center gap-2 bg-[#131849] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#1a2680] transition-all text-sm shadow-md">
                  Browse Properties <ArrowRight size={15}/>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((p) => (
                    <PropertyCard key={p._id} property={p} onFavoriteToggle={handleRemove} />
                  ))}
                </div>
                <div className="mt-8 text-center">
                  <Link href="/properties" className="inline-flex items-center gap-2 text-[#131849] font-semibold hover:text-yellow-500 transition-colors text-sm">
                    Discover more properties <ArrowRight size={15}/>
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
