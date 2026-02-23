# MyCOINFLIP — Crypto Trading Platform

A full-stack crypto trading platform with real-time market data, timed trading, admin panel, and wallet management.

![Vue.js](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?logo=tailwindcss&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Admin Panel](#admin-panel)
- [License](#license)

---

## Features

### Trading

- **Real-time charts** — TradingView widget with live candlestick data
- **Timed Trading** — Predict price direction (CALL/PUT) with configurable durations (10s, 30s, 60s, etc.)
- **Live order book** & **market trades** via Binance WebSocket
- **10+ supported coins** — BTC, ETH, SOL, BNB, XRP, DOGE, ADA, AVAX, DOT, LINK
- **Coin logos** from CoinGecko API

### Wallet

- **Deposit** with proof image upload
- **Withdrawal** with address input
- **USDT balance** management
- Pending transaction approval by admin

### Admin Panel

- **Dashboard** — Platform overview & statistics
- **User Management** — Ban/unban users, set profit mode (random/win/loss)
- **Finance** — Approve/reject deposits & withdrawals, view proof images with lightbox
- **KYC Management** — Review & approve user identity documents
- **Admin Wallet** — Configure deposit addresses per network (TRC20, ERC20, BEP20) — SUPERUSER only
- **Trading Settings** — Configure trading durations & win/loss percentages (max 6 slots)
- **Admin Management** — Create/delete admin accounts — SUPERUSER only

### Security

- **JWT authentication** with role-based access control
- **Three roles**: `USER`, `ADMIN`, `SUPERUSER`
- **Password hashing** with bcrypt
- **Ban system** with middleware enforcement
- **File upload validation** via Multer

---

## Tech Stack

### Frontend

| Technology         | Purpose                        |
| ------------------ | ------------------------------ |
| Vue.js 3           | UI framework (Composition API) |
| Vue Router 5       | Client-side routing            |
| Pinia 3            | State management               |
| Axios              | HTTP client                    |
| TailwindCSS 4      | Utility-first CSS              |
| Lightweight Charts | TradingView chart library      |

### Backend

| Technology     | Purpose                     |
| -------------- | --------------------------- |
| Express 5      | HTTP server & REST API      |
| Prisma 7       | ORM & database migrations   |
| PostgreSQL     | Relational database         |
| JSON Web Token | Authentication              |
| bcrypt         | Password hashing            |
| Multer         | File upload handling        |
| WebSocket (ws) | Real-time market data relay |

---

## Project Structure

```
crypto-dashboard/
├── public/                  # Static assets
├── src/                     # Frontend (Vue.js)
│   ├── api/
│   │   └── axios.js         # Axios instance with interceptors
│   ├── assets/              # Images & logos
│   ├── components/
│   │   ├── TradeForm.vue    # Trading interface
│   │   ├── OrderHistory.vue # Order history & open positions
│   │   ├── OrderBook.vue    # Live order book
│   │   ├── MarketTrades.vue # Live market trades
│   │   └── TVChartWidget.vue
│   ├── layouts/
│   │   └── AdminLayout.vue  # Admin panel layout
│   ├── router/
│   │   └── index.js         # Route definitions & guards
│   ├── stores/
│   │   ├── auth.js          # Authentication state
│   │   ├── wallet.js        # Wallet, trades, positions
│   │   ├── market.js        # Market data, WebSocket, coins
│   │   └── admin.js         # Admin panel state
│   └── views/
│       ├── LandingPage.vue
│       ├── Login.vue
│       ├── Register.vue
│       ├── Dashboard.vue    # Main trading view
│       ├── Wallet.vue
│       ├── Deposit.vue
│       ├── Withdrawal.vue
│       ├── UserProfile.vue
│       ├── KYC.vue
│       ├── Banned.vue
│       └── admin/
│           ├── AdminLogin.vue
│           ├── AdminDashboard.vue
│           ├── AdminUsers.vue
│           ├── AdminFinance.vue
│           ├── AdminKYC.vue
│           ├── AdminSettings.vue
│           ├── AdminWallet.vue
│           ├── AdminAdmins.vue
│           └── AdminProfile.vue
│
├── server/                  # Backend (Express.js)
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── src/
│   │   ├── server.js        # Entry point
│   │   ├── app.js           # Express app configuration
│   │   ├── db.js            # Prisma client instance
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── walletController.js
│   │   │   ├── tradeController.js
│   │   │   └── adminController.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── walletRoutes.js
│   │   │   ├── tradeRoutes.js
│   │   │   └── adminRoutes.js
│   │   ├── middleware/
│   │   │   └── authMiddleware.js
│   │   └── services/
│   │       └── marketService.js
│   ├── uploads/             # User-uploaded files (gitignored)
│   └── .env                 # Environment variables (gitignored)
│
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** ≥ 14
- **npm** ≥ 9

### 1. Clone the repository

```bash
git clone https://github.com/bebeksalju/mycoinflip.git
cd mycoinflip
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create `server/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/mycoinflip"
PORT=3000
JWT_SECRET="your-secret-key-here"
```

### 5. Setup database

```bash
cd server
npx prisma generate
npx prisma db push
```

### 6. Create the first SUPERUSER

Connect to your PostgreSQL database and insert:

```sql
-- Password: admin123 (bcrypt hash)
INSERT INTO "User" (email, password, name, role, "profitMode", status, "createdAt", "updatedAt")
VALUES (
  'admin@mycoinflip.com',
  '$2b$10$YOUR_BCRYPT_HASH_HERE',
  'Super Admin',
  'SUPERUSER',
  'random',
  'active',
  NOW(),
  NOW()
);
```

Or register via `/register` and manually update the role to `SUPERUSER` in the database.

### 7. Start development servers

**Terminal 1** — Backend:

```bash
cd server
npm run dev
```

**Terminal 2** — Frontend:

```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3000`.

---

## Environment Variables

| Variable       | Description                  | Example                                            |
| -------------- | ---------------------------- | -------------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/mycoinflip` |
| `PORT`         | Backend server port          | `3000`                                             |
| `JWT_SECRET`   | Secret key for JWT signing   | `my-super-secret-key`                              |

---

## Database

### Models

| Model             | Description                                           |
| ----------------- | ----------------------------------------------------- |
| `User`            | User accounts with roles (USER, ADMIN, SUPERUSER)     |
| `Wallet`          | USDT balance & crypto assets (JSON)                   |
| `Transaction`     | Deposits, withdrawals, and trade records              |
| `Kyc`             | KYC documents & verification status                   |
| `AdminWallet`     | Deposit addresses per network (TRC20/ERC20/BEP20)     |
| `TradingDuration` | Configurable trading durations & win/loss percentages |

### Schema diagram

```
User 1:1 Wallet
User 1:1 Kyc
User 1:N Transaction
AdminWallet (standalone)
TradingDuration (standalone)
```

---

## API Reference

Base URL: `http://localhost:3000/api`

### Authentication

| Method | Endpoint            | Description           | Auth |
| ------ | ------------------- | --------------------- | ---- |
| `POST` | `/auth/register`    | Register new user     | No   |
| `POST` | `/auth/login`       | Login & get JWT token | No   |
| `POST` | `/auth/admin/login` | Admin login           | No   |

### Wallet

| Method | Endpoint           | Description                       | Auth |
| ------ | ------------------ | --------------------------------- | ---- |
| `GET`  | `/wallet/balance`  | Get user wallet balance           | JWT  |
| `POST` | `/wallet/deposit`  | Submit deposit (with proof image) | JWT  |
| `POST` | `/wallet/withdraw` | Submit withdrawal                 | JWT  |

### Trading

| Method | Endpoint           | Description                     | Auth |
| ------ | ------------------ | ------------------------------- | ---- |
| `POST` | `/trade`           | Execute spot trade              | JWT  |
| `POST` | `/trade/settle`    | Settle timed trade              | JWT  |
| `GET`  | `/trade/stats`     | Get user trade stats            | JWT  |
| `GET`  | `/trade/durations` | Get available trading durations | JWT  |

### Admin

| Method   | Endpoint                       | Description                | Auth            |
| -------- | ------------------------------ | -------------------------- | --------------- |
| `GET`    | `/admin/dashboard`             | Platform statistics        | JWT (Admin)     |
| `GET`    | `/admin/users`                 | List all users             | JWT (Admin)     |
| `PUT`    | `/admin/users/:id/status`      | Ban/unban user             | JWT (Admin)     |
| `PUT`    | `/admin/users/:id/profit-mode` | Set user profit mode       | JWT (Admin)     |
| `GET`    | `/admin/transactions`          | List all transactions      | JWT (Admin)     |
| `PUT`    | `/admin/transactions/:id`      | Approve/reject transaction | JWT (Admin)     |
| `GET`    | `/admin/kyc`                   | List KYC submissions       | JWT (Admin)     |
| `PUT`    | `/admin/kyc/:id`               | Approve/reject KYC         | JWT (Admin)     |
| `GET`    | `/admin/wallets`               | Get deposit addresses      | JWT (Admin)     |
| `PUT`    | `/admin/wallets`               | Update deposit address     | JWT (Superuser) |
| `GET`    | `/admin/durations`             | Get trading durations      | JWT (Admin)     |
| `POST`   | `/admin/durations`             | Add trading duration       | JWT (Admin)     |
| `DELETE` | `/admin/durations/:id`         | Remove trading duration    | JWT (Admin)     |
| `GET`    | `/admin/admins`                | List admin accounts        | JWT (Superuser) |
| `POST`   | `/admin/admins`                | Create admin account       | JWT (Superuser) |
| `DELETE` | `/admin/admins/:id`            | Delete admin account       | JWT (Superuser) |

---

## Admin Panel

Access the admin panel at `/admin/login`.

### Roles & Permissions

| Feature                | ADMIN | SUPERUSER |
| ---------------------- | ----- | --------- |
| View dashboard         | ✅    | ✅        |
| Manage users           | ✅    | ✅        |
| Manage finance         | ✅    | ✅        |
| Manage KYC             | ✅    | ✅        |
| Trading settings       | ✅    | ✅        |
| Admin wallet addresses | ❌    | ✅        |
| Create/delete admins   | ❌    | ✅        |

---

## License

This project is proprietary. All rights reserved.

---

<p align="center">
  Built with ❤️ by <strong>Beruang Salju & Yachan</strong>, mana uangku yang masih sisa itu wok
</p>
