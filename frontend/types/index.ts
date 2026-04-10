export interface Property {
  _id: string;
  title: string;
  description: string;
  type: 'apartment' | 'house' | 'villa' | 'studio' | 'commercial';
  status: 'pending' | 'approved' | 'rejected' | 'rented' | 'sold';
  price: number;
  priceType: 'total' | 'monthly' | 'yearly';
  location: { address: string; city: string; state?: string; country?: string; zipCode?: string };
  features: { bedrooms: number; bathrooms: number; area?: number; parking?: boolean; furnished?: boolean; petFriendly?: boolean; pool?: boolean; gym?: boolean };
  images: { url: string; publicId?: string }[];
  owner: { _id: string; name: string; email: string; phone?: string };
  availableFrom?: string;
  availableTo?: string;
  isFeatured?: boolean;
  views?: number;
  inquiryCount?: number;
  rejectedReason?: string;
  createdAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  cnic: string;
  role: 'user' | 'owner' | 'admin';
  phone?: string;
  isActive?: boolean;
  isVerified?: boolean;
  favorites?: string[];
  cnicFrontUrl?: string;
  cnicBackUrl?: string;
  createdAt?: string;
}

export interface Inquiry {
  _id: string;
  property: Property;
  sender: User;
  owner: User;
  message: string;
  phone?: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  reply?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface Booking {
  _id: string;
  property: Property;
  buyer: User;
  owner: User;
  bookingType: 'rent' | 'buy';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
  buyerCnic: string;
  cnicFrontUrl: string;
  cnicBackUrl: string;
  additionalProofUrl?: string;
  buyerNote?: string;
  agreedPrice: number;
  depositAmount?: number;
  startDate: string;
  endDate?: string;
  ownerNote?: string;
  approvedAt?: string;
  rejectedReason?: string;
  contractUrl?: string;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  booking: Booking | string;
  property: Property;
  payer: User;
  receiver: User;
  transactionType: 'deposit' | 'monthly_rent' | 'purchase_payment' | 'partial_payment' | 'refund';
  amount: number;
  currency: string;
  month?: string;
  description?: string;
  paymentMethod: 'bank_transfer' | 'easypaisa' | 'jazzcash' | 'cash' | 'cheque' | 'other';
  accountTitle?: string;
  accountNumber?: string;
  bankName?: string;
  proofUrl: string;
  transactionRef?: string;
  status: 'pending' | 'verified' | 'disputed' | 'rejected';
  verifiedAt?: string;
  ownerNote?: string;
  paidAt: string;
  createdAt: string;
}
