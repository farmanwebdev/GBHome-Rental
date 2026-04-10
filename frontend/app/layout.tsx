import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'GBRentals – Premium Real Estate',
  description: 'Discover exclusive properties. Rent or buy with confidence.',
  keywords: 'real estate, rentals, properties, apartments, houses',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'DM Sans, sans-serif', borderRadius: '12px', background: '#131849', color: '#fff' } }} />
      </body>
    </html>
  );
}
