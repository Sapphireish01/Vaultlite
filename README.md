# 🏦 VaultLite — Modern Digital Wallet

A premium, backend-first fintech dashboard built with **Next.js 16**, **TypeScript**, **Prisma**, and **PostgreSQL**. Featuring a modern glassmorphism UI, dynamic data visualization, and secure authentication.

No real payments. Real-world engineering patterns.

---

## ✨ Features

- 💎 **Modern UI**: Sleek, glassmorphism-inspired design using Tailwind CSS.
- 📊 **Dynamic Analytics**: Real-time spending trends and category breakdowns with Recharts.
- 🔐 **Secure Auth**: JWT-based authentication with `httpOnly` cookies and session management.
- 💳 **Wallet Management**: Transaction tracking with atomic database operations.
- 🌓 **Dark Mode**: Fully responsive theme support with `next-themes`.
- 📱 **Responsive Design**: Optimized for all screen sizes with a custom sidebar navigation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Lucide React](https://lucide.dev/) (Icons), [Recharts](https://recharts.org/) (Charts)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js)

---

## 🗂️ Project Structure

```
vaultlite/
├── prisma/
│   ├── schema.prisma       ← Database models & relationships
│   └── seed.ts             ← Test data seeder
│
├── src/
│   ├── app/
│   │   ├── api/            ← Backend Route Handlers
│   │   │   ├── auth/       ← Login, Register, Logout, Me
│   │   │   ├── wallet/     ← Balance & limits
│   │   │   └── transactions/ ← Transaction history
│   │   ├── dashboard/      ← Main UI (Analytics, History, Settings)
│   │   └── auth/           ← Auth Pages
│   │
│   ├── components/
│   │   └── dashboard/      ← Reusable UI (Charts, Cards, Sidebar)
│   │
│   ├── lib/
│   │   ├── db.ts           ← Prisma Client singleton
│   │   ├── auth.ts         ← JWT & Session logic
│   │   └── utils.ts        ← Styling & formatting helpers
│   │
│   └── proxy.ts       ← Auth guards for protected routes
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/vaultlite.git
cd vaultlite
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Edit `.env` and provide your `DATABASE_URL` (Neon, Supabase, or Local) and a `JWT_SECRET`.

### 3. Database Setup
```bash
npm run db:push    # Sync schema to DB
npm run db:seed    # Populate with initial test data
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

**Test User:** `test@vaultlite.com` / `password123`

---

## 🔌 API Reference

### Authentication
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Authenticate & create session |
| `POST` | `/api/auth/logout` | Clear session cookies |
| `GET` | `/api/auth/me` | Fetch current user profile |

### Wallet & Transactions
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/wallet` | Get balance and monthly limits |
| `GET` | `/api/transactions` | List all transactions (Paginated) |
| `POST` | `/api/transactions` | Create a new CREDIT/DEBIT entry |

---

## 💡 Engineering Patterns

### 💰 Money Integrity
We store all currency as **integers** (Kobo/Cents) to avoid the infamous floating-point arithmetic bugs.
```typescript
// Always store 150.00 as 15000
const amountInKobo = amountInNaira * 100;
```

### 🛡️ Atomic Transactions
Money movements use Prisma's `$transaction` to ensure balance updates and records happen together or not at all.

### 🍪 Secure Sessions
JWTs are stored in `httpOnly` cookies, preventing client-side scripts from accessing tokens and mitigating XSS risks.

---

## 🛠️ Commands

- `npm run dev`: Start development server
- `npm run db:push`: Sync Prisma schema to database
- `npm run db:studio`: GUI for database management
- `npm run db:seed`: Reset and seed database
- `npm run lint`: Run ESLint checks
