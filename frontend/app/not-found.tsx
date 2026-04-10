import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#131849] flex items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="font-display font-bold text-[10rem] leading-none text-white/10 select-none mb-4">
          404
        </div>
        <h1 className="font-display text-4xl font-bold text-white mb-4">
          Page not found
        </h1>
        <p className="text-white/60 text-lg mb-10 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-yellow-400 text-[#131849] font-bold px-8 py-4 rounded-xl hover:bg-yellow-500 transition-all shadow-lg text-sm"
          >
            <Home size={16} /> Back to Home
          </Link>
          <Link
            href="/properties"
            className="flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all text-sm"
          >
            <Search size={16} /> Browse Properties
          </Link>
        </div>
      </div>
    </div>
  );
}
