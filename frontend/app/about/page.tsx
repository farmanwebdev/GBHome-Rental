import Image from 'next/image';
import Link from 'next/link';
import { Shield, Star, Users, Building2, Heart, Award, MapPin, Phone, Mail, CheckCircle, TrendingUp } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AuthProvider from '@/components/ui/AuthProvider';

const STATS = [
  { value: '2,400+', label: 'Properties Listed' },
  { value: '18,000+', label: 'Verified Members' },
  { value: '4,200+', label: 'Successful Rentals' },
  { value: '99%',  label: 'Customer Satisfaction' },
];

const VALUES = [
  { icon: Shield,    title: 'Trust & Transparency', desc: 'Every listing is verified. Every member is CNIC-authenticated. We maintain full transparency so you always know who you are dealing with.' },
  { icon: Star,      title: 'Premium Quality',      desc: 'We curate only the finest properties across Pakistan. Our team personally reviews each listing before it goes live.' },
  { icon: Heart,     title: 'Customer First',        desc: 'From your first search to your last rent receipt, our dedicated support team is here to guide you every step of the way.' },
  { icon: TrendingUp,title: 'Secure Transactions',   desc: 'Every rent payment, deposit, and booking is recorded with proof uploads and CNIC verification — your money is always protected.' },
];

const TEAM = [
  { name: 'Farman Saqib', role: 'Founder & CEO',       bio: 'Real estate visionary with 15+ years of property development experience across Pakistan.',    image: '/team/farman.png' },
  { name: 'Sara Ahmed',   role: 'Head of Operations',   bio: 'Former property consultant managing a portfolio of 300+ premium listings nationwide.',         image: '/team/farman.png' },
  { name: 'Tanveer Ahmad',    role: 'Chief Technology',     bio: 'Full-stack engineer building secure, scalable platforms trusted by thousands of users.',         image: '/team/farman.png' },
  { name: 'Nadia Malik',  role: 'Customer Success',     bio: 'Dedicated to ensuring every tenant and owner has a smooth, stress-free experience.',           image: '/team/farman.png' },
];

const MILESTONES = [
  { year: '2020', event: 'GBRentals founded in Lahore with a vision for transparent real estate' },
  { year: '2021', event: 'Launched CNIC-verified accounts — first platform in Pakistan to do so' },
  { year: '2022', event: 'Reached 5,000 verified listings across 10 major cities' },
  { year: '2023', event: 'Introduced digital rent receipts and transaction tracking system' },
  { year: '2024', event: 'Crossed 15,000 active members and 3,000 successful rental agreements' },
  { year: '2025', event: 'Launched mobile-first platform and AI-powered property matching' },
  { year: '2026', event: 'Serving 18,000+ members across all major cities of Pakistan' },
];

const CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
];

//=====about page with hero, stats, mission, values, timeline, team, cities, contact sections=====//

export default function AboutPage() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* Hero */}
        <section className="relative pt-32 pb-20 bg-[#131849] overflow-hidden">
          <div className="absolute inset-0">
            <img src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800" alt="" className="w-full h-full object-cover opacity-10" />
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="inline-block py-1.5 px-4 rounded-full bg-yellow-400/20 border border-yellow-400/30 text-yellow-300 text-sm font-semibold mb-6 tracking-widest uppercase">
              About GBRentals
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Pakistan's Most Trusted<br />
              <span className="text-yellow-400">Real Estate Platform</span>
            </h1>
            <p className="text-white/70 text-xl max-w-3xl mx-auto leading-relaxed">
              Founded in 2020, GBRentals was built on one simple belief: finding or renting a home should be safe, transparent, and stress-free — for everyone.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white py-16 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="font-display text-4xl font-bold text-[#131849] mb-2">{value}</div>
                  <div className="text-sm text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="text-yellow-500 font-semibold text-sm tracking-widest uppercase mb-3">Our Mission</div>
                <h2 className="font-display text-4xl font-bold text-[#131849] mb-6 leading-tight">
                  Making Real Estate Accessible, Safe & Transparent
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  In Pakistan, property transactions have long been plagued by fraud, unclear agreements, and missing documentation. GBRentals was created to solve exactly that.
                </p>
                <p className="text-gray-600 leading-relaxed mb-8">
                  By requiring CNIC verification for every account, digitising rent receipts, recording every transaction, and enabling direct owner-to-tenant communication — we've created a platform where both parties are protected at every step.
                </p>
                <div className="space-y-3">
                  {[
                    'CNIC-verified members only',
                    'Every booking documented with proof',
                    'Digital rent receipts & payment history',
                    'Direct owner–tenant communication',
                    'Admin oversight for fraud prevention',
                  ].map(p => (
                    <div key={p} className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-emerald-500 shrink-0" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-64 h-64 bg-yellow-400/10 rounded-3xl" />
                <img
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"
                  alt="Our mission"
                  className="relative z-10 w-full rounded-3xl shadow-2xl object-cover h-96"
                />
                <div className="absolute -bottom-6 -right-6 bg-[#131849] text-white p-6 rounded-2xl shadow-xl z-20">
                  <div className="font-display text-3xl font-bold text-yellow-400 mb-1">6+</div>
                  <div className="text-sm text-white/70">Years of Excellence</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-yellow-500 font-semibold text-sm tracking-widest uppercase mb-3">What We Stand For</div>
              <h2 className="font-display text-4xl font-bold text-[#131849]">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-5 p-6 rounded-2xl bg-gray-50 border border-gray-100 hover:border-[#131849]/20 hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-[#131849] rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[#131849] mb-2">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How CNIC system works */}
        <section className="py-24 bg-[#131849]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-yellow-400 font-semibold text-sm tracking-widest uppercase mb-3">Security First</div>
              <h2 className="font-display text-4xl font-bold text-white mb-4">Why CNIC Verification?</h2>
              <p className="text-white/60 max-w-2xl mx-auto">
                We require every member — tenant or owner — to register with their CNIC. This simple step eliminates fraud, builds trust, and creates legal accountability.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step:'01', title:'Register with CNIC',  desc:'Every user registers with their valid CNIC number. Format: XXXXX-XXXXXXX-X. This becomes your unique identity on the platform.' },
                { step:'02', title:'Book with Proof',      desc:'When booking a property, tenants upload both sides of their CNIC as proof of identity, alongside any supporting documents.' },
                { step:'03', title:'Pay with Records',     desc:'Every monthly rent payment is uploaded with a screenshot or receipt, creating a permanent, tamper-proof payment history for both parties.' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
                  <div className="font-display text-5xl font-bold text-yellow-400/30 mb-4">{step}</div>
                  <h3 className="font-display font-bold text-xl text-white mb-3">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-yellow-500 font-semibold text-sm tracking-widest uppercase mb-3">Our Journey</div>
              <h2 className="font-display text-4xl font-bold text-[#131849]">Milestones</h2>
            </div>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-8">
                {MILESTONES.map(({ year, event }) => (
                  <div key={year} className="flex gap-6 items-start">
                    <div className="w-16 h-16 bg-[#131849] rounded-2xl flex items-center justify-center shrink-0 relative z-10 shadow-lg">
                      <span className="font-display font-bold text-yellow-400 text-sm">{year}</span>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm mt-2">
                      <p className="text-sm text-gray-700 leading-relaxed">{event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="text-yellow-500 font-semibold text-sm tracking-widest uppercase mb-3">Our People</div>
              <h2 className="font-display text-4xl font-bold text-[#131849]">Meet the Team</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {TEAM.map(({ name, role, bio, image }) => (
                <div key={name} className="text-center group">
                  <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden shadow-xl ring-2 ring-yellow-400/20 bg-gray-100">
                    <Image src={image} alt={`Photo of ${name}`} fill className="object-cover" sizes="96px" unoptimized />
                  </div>
                  <h3 className="font-display font-bold text-[#131849] mb-1">{name}</h3>
                  <p className="text-yellow-500 text-xs font-semibold uppercase tracking-wide mb-3">{role}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin size={18} className="text-yellow-500" />
              <h2 className="font-display text-2xl font-bold text-[#131849]">We Operate Across Pakistan</h2>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {CITIES.map(city => (
                <Link key={city} href={`/properties?city=${city}`}
                  className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:border-[#131849] hover:text-[#131849] hover:shadow-sm transition-all">
                  {city}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { icon: MapPin, title: 'Head Office', lines: ['123 Main Boulevard', 'Gulberg III, Lahore', 'Punjab, Pakistan'] },
                { icon: Phone,  title: 'Call Us',     lines: ['+92-42-1234-5678', '+92-300-1234-567', 'Mon–Sat, 9am–6pm PKT'] },
                { icon: Mail,   title: 'Email Us',    lines: ['hello@gbrentals.com', 'support@gbrentals.com', 'We reply within 24hrs'] },
              ].map(({ icon: Icon, title, lines }) => (
                <div key={title} className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
                  <div className="w-12 h-12 bg-[#131849] rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-yellow-400" />
                  </div>
                  <h3 className="font-display font-bold text-[#131849] mb-3">{title}</h3>
                  {lines.map(l => <p key={l} className="text-sm text-gray-600">{l}</p>)}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-yellow-400 to-yellow-500">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="font-display text-4xl font-bold text-[#131849] mb-4">Ready to Get Started?</h2>
            <p className="text-[#131849]/70 text-lg mb-8">
              Join 18,000+ verified members and find your perfect home today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register"
                className="bg-[#131849] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#1a2680] transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm">
                Create Free Account
              </Link>
              <Link href="/properties"
                className="bg-white text-[#131849] font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-sm">
                Browse Properties
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </AuthProvider>
  );
}
