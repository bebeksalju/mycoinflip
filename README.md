# Crypto Dashboard & Admin Panel

A comprehensive cryptocurrency trading simulation platform featuring a modern user dashboard, trading interface, and a robust administrative panel for user management and system configuration.

## Features

### 🚀 User Dashboard

- **Real-time Market Data:** Live price updates via Binance WebSocket and CoinGecko API.
- **Trading Interface:** Buy/Sell/Time-based trading simulation.
- **Wallet Management:** Deposit and withdrawal request system.
- **KYC Verification:** Identity verification flow with document upload simulation.
- **Profile Management:** User profile settings and history.
- **Mobile Responsive:** Optimized layout for all devices.

### 🛡️ Admin Panel

- **Role-Based Access Control:**
  - **Superuser:** Full system access (Manage Admins, Settings, Users, Finance).
  - **Administrator:** Limited access (Manage Users, Finance, KYC).
- **User Management:**
  - View detailed user profiles (Personal Info, Balance, Status).
  - Ban/Unban users.
  - **Profit Mode (Rigged Logic):** Force Win/Loss outcomes for specific users.
  - Edit user balances (Superuser only).
- **Finance Management:** Approve/Reject deposit and withdrawal requests.
- **KYC Management:** Review and approve identity verification documents.
- **System Settings:** Configure trading durations and platform settings.

## Tech Stack

- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Pinia
- **Routing:** Vue Router
- **Icons:** Heroicons

## Setup & Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd crypto-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Admin Credentials (Mock)

| Role              | Email                | Password |
| ----------------- | -------------------- | -------- |
| **Superuser**     | `admin@crypto.com`   | `admin`  |
| **Administrator** | `manager@crypto.com` | `admin`  |

## Project Structure

- `src/views/`: Page components (Dashboard, Login, Register, Wallet, etc.)
- `src/views/admin/`: Admin panel specific pages.
- `src/layouts/`: Layout wrappers (AdminLayout).
- `src/stores/`: Pinia stores for state management (auth, market, wallet, admin).
- `src/components/`: Reusable UI components.

## License

MIT
