'use client';

import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Twitter, Facebook } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function Footer() {
  const { user } = useAuthStore();
  const showBookingsLink = !user || user.role === 'user';

  return (
    <footer className="bg-[#131849] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-yellow-400 rounded-xl flex items-center justify-center text-[#131849] font-bold text-sm">GB</div>
              <span className="font-display font-bold text-xl">Rentals</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Pakistan's most trusted real estate platform. CNIC-verified members, secure transactions, and transparent rent records.
            </p>
            <div className="flex gap-3 pt-1">
              {[Instagram, Twitter, Facebook].map((Icon, i) => (
                <button key={i} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-5">Quick Links</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {[
                { href: '/',            label: 'Home' },
                { href: '/properties',  label: 'Browse Properties' },
                { href: '/about',       label: 'About Us' },
                ...(showBookingsLink ? [{ href: '/transactions', label: 'My Bookings' }] : []),
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-yellow-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-5">Contact</h4>
            <ul className="space-y-4 text-sm text-white/60">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-yellow-400 shrink-0 mt-0.5" />
                <span>123 Main Boulevard<br />Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-yellow-400 shrink-0" />
                <span>+92-42-1234-5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-yellow-400 shrink-0" />
                <span>hello@gbrentals.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-lg mb-5">Newsletter</h4>
            <p className="text-sm text-white/60 mb-4">Subscribe for the latest listings and market insights.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 text-sm" />
              <button className="px-4 py-2.5 bg-yellow-400 text-[#131849] rounded-xl font-bold text-sm hover:bg-yellow-500 transition-colors whitespace-nowrap">
                Join
              </button>
            </div>
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-3">
              <p className="text-xs text-white/50">🔒 CNIC-verified accounts only. Your data is protected.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© 2026 GBRentals. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition-colors">Terms of Service</span>
            <Link href="/about" className="cursor-pointer hover:text-white transition-colors">About Us</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
