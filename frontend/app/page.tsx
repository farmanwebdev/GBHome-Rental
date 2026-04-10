'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Building2, Heart, Star, TrendingUp, Users, CheckCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import SearchBar from '@/components/property/SearchBar';
import AuthProvider from '@/components/ui/AuthProvider';
import { propertyAPI } from '@/lib/api';
import { Property } from '@/types';

const STATS = [
  { icon: Building2, value: '2,400+', label: 'Properties Listed' },
  { icon: Users, value: '18,000+', label: 'Happy Tenants' },
  { icon: CheckCircle, value: '99%', label: 'Verified Listings' },
  { icon: TrendingUp, value: '4.9★', label: 'Average Rating' },
];

const WHY_US = [
  { icon: Shield, title: 'Secure & Trusted', desc: 'Every listing is verified by our team. What you see is what you get — guaranteed.' },
  { icon: Building2, title: 'Premium Selection', desc: 'Access exclusive properties in the most sought-after neighborhoods worldwide.' },
  { icon: Heart, title: 'Dedicated Support', desc: 'Our concierge team is available 24/7 to help you find your perfect home.' },
];

export default function HomePage() {
  const [featured, setFeatured] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    propertyAPI.getFeatured()
      .then((res) => setFeatured(res.data.properties || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Hero */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=90"
              alt="Luxury home"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#131849]/95 via-[#131849]/70 to-transparent" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
            <div className="max-w-3xl animate-fade-up">
              <span className="inline-block py-1.5 px-4 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-sm font-semibold mb-6 tracking-widest uppercase backdrop-blur-sm">
                Premium Real Estate
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white leading-tight mb-6">
                Find Your Next<br />
                <span className="text-yellow-400">Perfect Home</span>
              </h1>
              <p className="text-lg md:text-xl text-white/75 mb-10 max-w-xl leading-relaxed">
                Discover exclusive properties in prime locations. Whether renting or buying — the finest selection awaits.
              </p>
              <SearchBar />
            </div>
          </div>

          {/* Stats bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {STATS.map(({ icon: Icon, value, label }) => (
                  <div key={label} className="flex items-center gap-3 text-white">
                    <div className="w-9 h-9 bg-yellow-400/20 rounded-xl flex items-center justify-center shrink-0">
                      <Icon size={18} className="text-yellow-400" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-lg leading-tight">{value}</div>
                      <div className="text-xs text-white/60">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <div className="flex items-center gap-2 text-yellow-500 font-semibold text-sm mb-2">
                  <Star size={16} fill="currentColor" /> Featured Picks
                </div>
                <h2 className="font-display text-4xl font-bold text-[#131849]">Discover Top Properties</h2>
              </div>
              <Link href="/properties" className="hidden sm:flex items-center gap-2 text-[#131849] font-semibold hover:text-yellow-500 transition-colors group">
                View all
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="h-56 bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : featured.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featured.map((p) => <PropertyCard key={p._id} property={p} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <Building2 size={48} className="mx-auto mb-4 opacity-30" />
                <p className="text-lg">No featured properties yet.</p>
                <Link href="/properties" className="mt-4 inline-block text-[#131849] font-semibold hover:underline">Browse all listings →</Link>
              </div>
            )}

            <div className="mt-10 text-center sm:hidden">
              <Link href="/properties" className="inline-flex items-center gap-2 border-2 border-[#131849] text-[#131849] font-semibold py-3 px-8 rounded-xl hover:bg-[#131849] hover:text-white transition-all">
                View All Properties <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Why Us */}
        <section className="py-24 bg-[#131849]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-4 text-yellow-400 font-semibold text-sm tracking-widest uppercase">Why GBRentals</div>
            <h2 className="font-display text-4xl font-bold text-white mb-16">The Smarter Way to Find Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {WHY_US.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col items-center group">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mb-6 group-hover:bg-yellow-400/20 transition-colors">
                    <Icon size={28} className="text-yellow-400" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed text-balance max-w-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-display text-4xl font-bold text-[#131849] mb-4">Ready to List Your Property?</h2>
            <p className="text-[#131849]/70 text-lg mb-8">Join thousands of owners who trust GBRentals to find quality tenants fast.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register?role=owner" className="bg-[#131849] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#1a2680] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                List a Property
              </Link>
              <Link href="/properties" className="bg-white text-[#131849] font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                Browse Listings
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AuthProvider>
  );
}
