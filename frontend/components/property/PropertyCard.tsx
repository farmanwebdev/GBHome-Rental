'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Bed, Bath, Square, Eye, Clock, XCircle } from 'lucide-react';
import { Property } from '@/types';
import { favoriteAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { getFullImageUrl, shouldUnoptimizeImage } from '@/lib/imageUtils';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface Props {
  property: Property;
  onFavoriteToggle?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending:  'bg-amber-100  text-amber-700  border-amber-200',
  rejected: 'bg-red-100   text-red-700    border-red-200',
  rented:   'bg-blue-100  text-blue-700   border-blue-200',
  sold:     'bg-gray-100  text-gray-600   border-gray-200',
};

const STATUS_LABELS: Record<string, string> = {
  approved: 'Available',
  pending:  'Pending Review',
  rejected: 'Rejected',
  rented:   'Rented',
  sold:     'Sold',
};

export default function PropertyCard({ property, onFavoriteToggle }: Props) {
  const { user } = useAuthStore();
  const [isFav, setIsFav] = useState(() => user?.favorites?.includes(property._id) ?? false);
  const [favLoading, setFavLoading] = useState(false);

  const isLocked    = property.status === 'sold' || property.status === 'rented';
  const isInactive  = property.status === 'pending' || property.status === 'rejected';
  
  const imgSrc = getFullImageUrl(property.images?.[0]?.url);

  const handleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user)       { toast.error('Sign in to save favorites'); return; }
    if (favLoading)  return;
    setFavLoading(true);
    try {
      await favoriteAPI.toggle(property._id);
      setIsFav(!isFav);
      onFavoriteToggle?.(property._id);
    } catch {
      toast.error('Failed to update favorites');
    } finally {
      setFavLoading(false);
    }
  };

  return (
    <Link
      href={`/properties/${property._id}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-[#131849]/20 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-56 overflow-hidden">
        <Image
          src={imgSrc}
          alt={property.title}
          fill
          unoptimized={shouldUnoptimizeImage(imgSrc)}
          className={`object-cover transition-transform duration-700 group-hover:scale-110 ${isInactive ? 'opacity-60' : ''}`}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border backdrop-blur-sm ${STATUS_STYLES[property.status]}`}>
            {STATUS_LABELS[property.status]}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm capitalize">
            {property.type}
          </span>
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFav}
          disabled={favLoading || isLocked}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
            isLocked
              ? 'bg-white/40 text-gray-400 cursor-not-allowed opacity-50'
              : isFav
              ? 'bg-red-500 text-white shadow-lg'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
        </button>

        {/* Locked overlay */}
        {(isLocked || isInactive) && (
          <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
            <span className="bg-white/95 text-gray-800 text-xs font-bold px-4 py-2 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5">
              {isInactive
                ? <><Clock size={12}/>{STATUS_LABELS[property.status]}</>
                : STATUS_LABELS[property.status]
              }
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2 gap-3">
          <h3 className="font-display font-bold text-base text-gray-900 line-clamp-1 group-hover:text-[#131849] transition-colors">
            {property.title}
          </h3>
          <span className="font-display font-bold text-lg text-[#131849] shrink-0">
            ${property.price.toLocaleString()}
            {property.priceType === 'monthly' && (
              <span className="text-xs text-gray-400 font-sans font-normal">/mo</span>
            )}
          </span>
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin size={13} className="mr-1 shrink-0" />
          <span className="truncate">
            {property.location.city}
            {property.location.state ? `, ${property.location.state}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm font-medium text-gray-600">
          {property.features.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed size={14} className="text-[#131849]" />
              <span>{property.features.bedrooms}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Bath size={14} className="text-[#131849]" />
            <span>{property.features.bathrooms}</span>
          </div>
          {property.features.area && (
            <div className="flex items-center gap-1.5">
              <Square size={14} className="text-[#131849]" />
              <span>{property.features.area.toLocaleString()} sqft</span>
            </div>
          )}
          {property.views !== undefined && (
            <div className="flex items-center gap-1 ml-auto text-gray-400 text-xs">
              <Eye size={12} />
              <span>{property.views}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
