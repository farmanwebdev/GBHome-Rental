'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Home, Building2, Heart, LayoutDashboard, LogOut, ChevronDown, User, MessageSquare, Receipt, Info } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function Navbar() {
  const [open,     setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef  = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router   = useRouter();
  const { user, clearAuth } = useAuthStore();
  const isHome   = pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const logout = () => { clearAuth(); router.push('/'); setDropOpen(false); setOpen(false); };

  const navBg   = scrolled || !isHome ? 'bg-white shadow-md py-3' : 'bg-transparent py-5';
  const textCol = scrolled || !isHome ? 'text-gray-800' : 'text-white';
  const logoCol = scrolled || !isHome ? 'text-[#131849]' : 'text-white';

  const dashLink = user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'owner' ? '/dashboard/owner' : null;

  const DROPDOWN_LINKS = [
    ...(dashLink ? [{ href: dashLink,       label: 'Dashboard',     icon: LayoutDashboard }] : []),
    ...(user?.role === 'user' ? [{ href: '/transactions', label: 'My Bookings', icon: Receipt }] : []),
    { href: '/favorites',    label: 'Saved Properties',icon: Heart },
    { href: '/inquiries',    label: 'My Inquiries',   icon: MessageSquare },
    { href: '/profile',      label: 'My Profile',     icon: User },
  ];

  const NAV_LINKS = [
    { href: '/',           label: 'Home' },
    { href: '/properties', label: 'Properties' },
    { href: '/about',      label: 'About' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-[#131849] rounded-xl flex items-center justify-center text-yellow-400 font-display font-bold text-sm">GB</div>
          <span className={`font-display font-bold text-2xl tracking-tight transition-colors ${logoCol}`}>Rentals</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}
              className={`text-sm font-medium transition-colors hover:text-yellow-500 ${textCol} ${pathname === href ? 'text-yellow-500' : ''}`}>
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropOpen(!dropOpen)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${textCol} hover:text-yellow-500`}>
                <div className="w-8 h-8 bg-[#131849] rounded-full flex items-center justify-center text-yellow-400 text-xs font-bold">
                  {user.name[0].toUpperCase()}
                </div>
                <span className="hidden lg:block">{user.name.split(' ')[0]}</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${dropOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropOpen && (
                <div className="absolute right-0 top-full mt-3 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate font-mono">{user.cnic}</p>
                    <span className={`inline-block mt-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                      user.role==='admin' ? 'bg-purple-100 text-purple-700' :
                      user.role==='owner' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{user.role}</span>
                  </div>

                  {DROPDOWN_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} onClick={() => setDropOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#131849] transition-colors ${pathname===href?'bg-gray-50 text-[#131849] font-semibold':''}`}>
                      <Icon size={15} className="text-gray-400" />{label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 w-full transition-colors">
                      <LogOut size={15} />Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className={`text-sm font-medium hover:text-yellow-500 transition-colors ${textCol}`}>Sign In</Link>
              <Link href="/auth/register" className="bg-yellow-400 text-[#131849] font-bold text-sm py-2 px-5 rounded-xl hover:bg-yellow-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">Register</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className={`md:hidden transition-colors ${textCol}`}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors ${pathname===href?'text-[#131849] bg-gray-50 font-semibold':'text-gray-700'}`}>
                {href==='/' ? <Home size={16} className="text-gray-400"/> : href==='/about' ? <Info size={16} className="text-gray-400"/> : <Building2 size={16} className="text-gray-400"/>}
                {label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="px-3 pt-3 pb-1 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Account</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{user.cnic}</p>
                </div>
                {DROPDOWN_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link key={href} href={href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                    <Icon size={16} className="text-gray-400" />{label}
                  </Link>
                ))}
                <button onClick={logout} className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 w-full border-t border-gray-100 mt-1">
                  <LogOut size={16} />Sign Out
                </button>
              </>
            ) : (
              <div className="pt-3 flex gap-3 border-t border-gray-100 mt-1">
                <Link href="/auth/login" onClick={() => setOpen(false)} className="flex-1 text-center border-2 border-[#131849] text-[#131849] font-semibold py-2.5 rounded-xl text-sm hover:bg-[#131849] hover:text-white transition-all">Sign In</Link>
                <Link href="/auth/register" onClick={() => setOpen(false)} className="flex-1 text-center bg-yellow-400 text-[#131849] font-bold py-2.5 rounded-xl text-sm hover:bg-yellow-500 transition-all">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
