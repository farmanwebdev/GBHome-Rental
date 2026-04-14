# 🏠 GBRentals – Full-Stack Real Estate Platform

A production-ready real estate rental platform built with **Next.js 14**, **Node.js/Express**, and **MongoDB**.

---

## 📁 Project Structure

```
gbrentals/
├── backend/          # Express.js API
│   ├── config/       # DB, Cloudinary, Seed
│   ├── controllers/  # Auth, Property, Inquiry, Favorite, Admin, Owner
│   ├── middleware/   # JWT auth, role authorization
│   ├── models/       # User, Property, Inquiry (Mongoose)
│   ├── routes/       # All API routes
│   └── server.js     # Entry point
└── frontend/         # Next.js 14 App Router
    ├── app/
    │   ├── page.tsx                    # Home
    │   ├── properties/page.tsx         # Listings + filters
    │   ├── properties/[id]/page.tsx    # Property detail
    │   ├── auth/login/page.tsx         # Login
    │   ├── auth/register/page.tsx      # Register
    │   ├── favorites/page.tsx          # Saved properties
    │   └── dashboard/
    │       ├── owner/page.tsx          # Owner dashboard
    │       └── admin/page.tsx          # Admin dashboard
    ├── components/
    │   ├── layout/   # Navbar, Footer
    │   ├── property/ # PropertyCard, SearchBar
    │   └── ui/       # AuthProvider
    ├── lib/          # api.ts (Axios), store.ts (Zustand)
    └── types/        # TypeScript interfaces
```

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run seed        # Populate sample data
npm run dev         # Start dev server on :5000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev         # Start on :3000
```

---

## 🔑 Environment Variables

### Backend `.env`
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRE` | Token expiry (e.g. `30d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL (e.g. `https://gbrentals.vercel.app`) |
| `PORT` | Server port (default: 5000) |

### Frontend `.env.local`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |

---

## 🧪 Demo Credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | admin@gbrentals.com | admin123 |
| Owner | owner@gbrentals.com | owner123 |
| User | user@gbrentals.com | user123 |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/profile` | Private |
| PUT | `/api/auth/password` | Private |

### Properties
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/properties` | Public |
| GET | `/api/properties/featured` | Public |
| GET | `/api/properties/:id` | Public |
| POST | `/api/properties` | Owner/Admin |
| PUT | `/api/properties/:id` | Owner/Admin |
| DELETE | `/api/properties/:id` | Owner/Admin |

### Inquiries
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/inquiries/:propertyId` | Private |
| GET | `/api/inquiries/my` | Private |
| GET | `/api/inquiries/owner` | Owner/Admin |
| PUT | `/api/inquiries/:id/reply` | Owner/Admin |

### Favorites
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/favorites` | Private |
| POST | `/api/favorites/:propertyId` | Private |

### Owner Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/owner/dashboard` | Owner |
| GET | `/api/owner/properties` | Owner |
| PUT | `/api/owner/properties/:id/status` | Owner |

### Admin Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/admin/dashboard` | Admin |
| GET | `/api/admin/users` | Admin |
| PUT | `/api/admin/users/:id` | Admin |
| DELETE | `/api/admin/users/:id` | Admin |
| GET | `/api/admin/properties` | Admin |
| PUT | `/api/admin/properties/:id` | Admin |

---

## ☁️ Deployment

### Backend → Render.com
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `.env`

### Frontend → Vercel
1. Import your repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add env variable: `NEXT_PUBLIC_API_URL=https://your-render-app.onrender.com/api`



### Image Uploads → Cloudinary
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud Name, API Key, API Secret to backend `.env`

---

## ✨ Features

- ✅ JWT Authentication (register, login, role-based)
- ✅ Property CRUD with image upload (Cloudinary)
- ✅ Property status: **pending** / **available** / **rented** / **sold**
- ✅ Status badges — locked actions on sold/rented
- ✅ Search & filter (type, city, price, bedrooms, status)
- ✅ Favorites / saved properties system
- ✅ Inquiry system with owner replies
- ✅ Owner dashboard (manage listings, view inquiries)
- ✅ Admin dashboard (manage all users & properties)
- ✅ Featured properties on homepage
- ✅ Responsive mobile-first design
- ✅ Vercel + Render + MongoDB Atlas deployment ready

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| Styling | Tailwind CSS, Playfair Display + DM Sans |
| State | Zustand |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| Images | Cloudinary + Multer |
| Deployment | Vercel (FE) + Render (BE) + Atlas (DB) |

---

## 🔄 System Flow (Corrected Architecture)

```
Owner submits property
        ↓
   status: "pending"
        ↓
  Admin reviews
   ↙         ↘
Approve      Reject (with reason)
   ↓               ↓
status: "approved"  status: "rejected"
   ↓                    ↓
Visible on           Owner sees
public site          rejection reason
                     Can fix & resubmit
```

### Status Meanings
| Status | Who sets it | Public visibility |
|---|---|---|
| `pending` | System (on create) | ❌ Hidden |
| `approved` | Admin | ✅ Visible |
| `rejected` | Admin (with reason) | ❌ Hidden |
| `rented` | Owner (after approved) | ✅ Visible (locked) |
| `sold` | Owner (after approved) | ✅ Visible (locked) |

### Image Upload
- **With Cloudinary configured**: Images upload to cloud CDN
- **Without Cloudinary** (local dev): Falls back to local disk storage at `/uploads/`
  - Images served at `http://localhost:5000/uploads/filename.jpg`
  - No config needed to get started!



## 🆕 New Features (Latest Update)

### 🪪 CNIC-Based Identity System
- **Register** requires CNIC in format `XXXXX-XXXXXXX-X` (e.g. `35201-1234567-9`)
- **Login** accepts either CNIC number **or** email + password
- CNIC is stored per user and displayed in the navbar dropdown
- CNIC auto-formats as you type (dashes inserted automatically)

### 📋 Property Booking System
- Users can apply to **Rent** or **Buy** a property
- 3-step booking wizard: Details → Documents → Confirm
- Required uploads: **CNIC Front** + **CNIC Back** images
- Optional: Additional proof (salary slip, employment letter)
- Owner receives application with all documents visible
- Owner can **Approve** or **Reject** (with reason)
- Approval auto-updates property status to `rented` or `sold`

### 💸 Rent Transaction Records
- Tenants upload monthly rent receipts with:
  - Payment method (Bank Transfer, EasyPaisa, JazzCash, Cash, Cheque)
  - Amount, month, bank name, account title, IBAN
  - Transaction reference number
  - Receipt screenshot / PDF
- Owner receives notification and can:
  - **Verify** payment (confirms receipt)
  - **Dispute** payment (flags issue, adds note)
- Full payment history maintained per booking

### 📖 About Page
- Company story, mission, values
- CNIC verification explanation
- Timeline of milestones (2020–2026)
- Team members
- Coverage cities across Pakistan
- Contact details

### New API Routes
| Method | Route | Description |
|---|---|---|
| POST | `/api/bookings/:propertyId` | Submit booking with CNIC proof |
| GET | `/api/bookings/my` | Tenant's own bookings |
| GET | `/api/bookings/owner` | Owner's received bookings |
| PUT | `/api/bookings/:id/approve` | Owner approves booking |
| PUT | `/api/bookings/:id/reject` | Owner rejects booking |
| POST | `/api/transactions/:bookingId` | Upload payment receipt |
| GET | `/api/transactions/my` | Tenant payment history |
| GET | `/api/transactions/received` | Owner received payments |
| PUT | `/api/transactions/:id/verify` | Owner verifies/disputes payment |

### New Frontend Pages
| Page | Route | Description |
|---|---|---|
| About | `/about` | Company info, team, CNIC system |
| Book Property | `/properties/[id]/book` | 3-step booking with CNIC upload |
| Transactions | `/transactions` | Tenant bookings + payment upload |
| Owner Bookings | `/dashboard/owner/bookings` | Approve/reject + verify payments |
