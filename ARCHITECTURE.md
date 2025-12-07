# The Hive - Architecture & Routes Documentation

## 📋 Project Overview
This is a **Next.js Full-Stack Application** (Frontend + Backend combined in one project).

### Current Structure: Monolithic (Mixed Frontend & Backend)
```
The-Hive (Next.js App)
├── Frontend (React Components)
│   ├── app/              ← Pages & UI
│   ├── components/       ← Reusable UI components
│   └── types/            ← TypeScript types
│
└── Backend (Node.js API)
    ├── app/api/          ← REST API Endpoints
    ├── db/               ← Database models
    ├── lib/              ← Utilities (auth, mail, etc.)
    └── .env.local        ← Environment variables
```

---

## 🛣️ ALL ROUTES MAPPED

### **Authentication Routes** (User login/register/password reset)

#### Frontend Pages:
| Route | File | Purpose |
|-------|------|---------|
| `/login` | `app/(auth)/login/page.tsx` | Login form |
| `/register` | `app/(auth)/register/page.tsx` | Registration form |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Forgot password form |
| `/reset-password/[token]` | `app/(auth)/reset-password/page.tsx` | Password reset form |

#### Backend API Endpoints:
| Method | Endpoint | File | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/auth/callback/credentials` | `app/api/auth/[...nextauth]/route.ts` | Login handler (NextAuth) |
| `POST` | `/api/auth/signin` | `app/api/auth/[...nextauth]/route.ts` | Sign in endpoint |
| `POST` | `/api/auth/signout` | `app/api/auth/[...nextauth]/route.ts` | Sign out endpoint |
| `POST` | `/api/register` | `app/api/register/route.ts` | User registration |
| `POST` | `/api/forgot-password` | `app/api/forgot-password/route.ts` | Send reset email |
| `POST` | `/api/reset-password` | `app/api/reset-password/route.ts` | Reset password with token |

### **Dashboard Routes** (Protected - requires login)

#### Frontend Pages:
| Route | File | Purpose |
|-------|------|---------|
| `/dashboard` | `app/(protected)/dashboard/page.tsx` | Main dashboard |
| `/dashboard/mycontracts` | `app/(protected)/dashboard/mycontracts/page.tsx` | View contracts |
| `/dashboard/mycontracts/newcontract` | `app/(protected)/dashboard/mycontracts/newcontract/page.tsx` | Create new contract |
| `/dashboard/requests` | `app/(protected)/dashboard/requests/page.tsx` | View requests |
| `/dashboard/lifecycle` | `app/(protected)/dashboard/lifecycle/page.tsx` | Contract lifecycle |
| `/dashboard/notifications` | `app/(protected)/dashboard/notifications/page.tsx` | Notifications |
| `/dashboard/settings` | `app/(protected)/dashboard/settings/page.tsx` | User settings |

#### Dashboard Components:
| Component | File | Purpose |
|-----------|------|---------|
| Sidebar Navigation | `components/Sidebar.tsx` | Left navigation menu |
| Dashboard Layout | `components/dashboard/` | Multiple dashboard UI components |
| Contract Card | `components/dashboard/ContractCard.tsx` | Single contract display |
| Contract Table | `components/dashboard/ContractTable.tsx` | List of contracts |
| Create Dialog | `components/dashboard/CreateContractDialog.tsx` | Dialog to create contract |
| Emergency Email | `components/dashboard/EmergencyEmailDialog.tsx` | Emergency notification dialog |

### **Public Pages**

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/(landing)/page.tsx` | Homepage/landing page |
| `/404` | `app/not-found.tsx` | Custom 404 page |

#### Landing Page Components:
| Component | File |
|-----------|------|
| Hero Section | `app/(landing)/_components/Hero.tsx` |
| Features | `app/(landing)/_components/Features.tsx` |
| Services | `app/(landing)/_components/Services.tsx` |
| Demo | `app/(landing)/_components/Demo.tsx` |
| Testimonials | `app/(landing)/_components/Testimonials.tsx` |

### **Layout Wrappers**

| Route | File | Purpose |
|-------|------|---------|
| Root Layout | `app/layout.tsx` | Main wrapper (includes Footer) |
| Dashboard Layout | `app/(protected)/dashboard/layout.tsx` | Dashboard wrapper |
| MyContracts Layout | `app/(protected)/dashboard/mycontracts/layout.tsx` | Contracts section wrapper |
| NewContract Layout | `app/(protected)/dashboard/mycontracts/newcontract/layout.tsx` | New contract page wrapper |

---

## 📦 Database Models

### User Model
**File:** `db/models/User.ts`

```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed with bcryptjs),
  resetToken: string | null,
  resetTokenExpiry: number | null,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Authentication Flow

```
1. User visits /login
2. Enters email & password
3. Frontend sends POST to /api/auth/callback/credentials
4. Backend validates against DB using bcrypt
5. NextAuth creates JWT token
6. User logged in & redirected to /dashboard
7. All /dashboard/* routes protected by auth middleware
```

---

## 📧 Email Services

**File:** `lib/mail.ts`

Used for:
- Password reset emails
- Emergency notifications

---

## 🛠️ Utility Functions

**File:** `lib/utils.ts`

Common utilities for:
- String formatting
- Data validation
- Helper functions

---

## 🌍 Environment Variables

**File:** `.env.local` (not in repo - create this!)

Required variables:
```
MONGODB_URI=mongodb://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## 📁 Project Structure Summary

```
The-Hive/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Public auth pages
│   ├── (landing)/                # Public landing pages
│   ├── (protected)/              # Private dashboard pages
│   ├── api/                      # Backend API routes
│   ├── layout.tsx                # Root layout
│   ├── error.tsx                 # Error boundary
│   ├── not-found.tsx             # 404 page
│   └── globals.css               # Global styles
│
├── components/                   # Reusable React components
│   ├── Footer.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── dashboard/                # Dashboard-specific components
│
├── db/                           # Database layer
│   ├── index.ts                  # MongoDB connection
│   └── models/
│       └── User.ts               # User schema
│
├── lib/                          # Utilities
│   ├── auth.ts                   # NextAuth configuration
│   ├── mail.ts                   # Email service
│   └── utils.ts                  # Helper functions
│
├── types/                        # TypeScript types
│   └── next-auth.d.ts            # NextAuth type extensions
│
├── public/                       # Static files
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── next.config.ts                # Next.js config
├── tailwind.config.js            # Tailwind CSS config
└── eslint.config.mjs             # ESLint config
```

---

## 🚀 Technology Stack

- **Frontend:** React 19 + TypeScript + TailwindCSS
- **Backend:** Next.js 16 API Routes
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** NextAuth.js v5
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer
- **Icons:** React Icons + Lucide React

---

## 🔄 Data Flow Example: User Registration

```
Frontend (register/page.tsx)
    ↓
User fills form & clicks "Register"
    ↓
Sends POST request to /api/register with { name, email, password }
    ↓
Backend (api/register/route.ts)
    ↓
Validates input
    ↓
Check if user exists in MongoDB
    ↓
Hash password with bcryptjs
    ↓
Save new user to MongoDB
    ↓
Return success response
    ↓
Frontend redirects to /login
```

---

## 📝 Next Steps for Refactoring

To separate Frontend & Backend into two separate projects:

1. **Create Backend Repository (Express.js or Nest.js)**
   - Move all `/api/*` routes to Express server
   - Move `/db` and `/lib` to backend
   - Update MongoDB connection

2. **Create Frontend Repository (Next.js)**
   - Keep all React components
   - Keep all pages in `/app`
   - Update API calls to point to backend server URL
   - Remove backend code

3. **Environment Setup**
   - Backend runs on `http://localhost:5000`
   - Frontend runs on `http://localhost:3000`
   - Add CORS in backend for frontend domain

See `REFACTORING_GUIDE.md` for detailed steps.
