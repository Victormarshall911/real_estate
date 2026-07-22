# 🏙️ LandMarket — Nigeria's Premier Real Estate & Architecture Marketplace

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://landmarketnig.vercel.app)

**LandMarket** is a next-generation real estate and architectural services marketplace tailored specifically for the Nigerian property market. It seamlessly connects property buyers, renters, verified real estate agents, professional realtors, private landlords, estate developers, and accredited architects on a unified, high-trust digital platform.

🌐 **Live Production Frontend**: [https://landmarketnig.vercel.app](https://landmarketnig.vercel.app)  
🔌 **Backend API Engine**: [https://real-estate-api-orbx.onrender.com/api/v1/](https://real-estate-api-orbx.onrender.com/api/v1/)

---

## ✨ Key Features

### 🏡 Verified Property Directory & Search
- **Advanced Filtering**: Search residential and commercial properties by location, state, LGA, price range, property category (Land vs. Building), and specific property types (Plot, Estate, House, Apartment, Commercial).
- **Dynamic Shimmering Skeletons**: Zero layout shift loading experience across directory and listing views.
- **Interactive Listings**: Rich image galleries, verified badges, direct agent WhatsApp/call interaction, and title document verification.

### 📐 Nigerian Architects & Planners Directory
- **Verified Portfolios**: Connect directly with accredited architectural firms and urban planners across Nigeria.
- **Architect Projects & Blueprints**: View architect-submitted blueprints, portfolio projects, layouts, and ECO designs.
- **Direct WhatsApp Consultation**: Contact professional architects instantly with auto-filled message scripts.

### 🤝 Verified Agents & Realtors Network
- **Trust & Transparency**: Browse verified agents with track records, connection reviews, and active service areas.
- **Agent Service Locations**: Agents list locations they cover alongside custom escrow connection fees.

### 👥 Interactive Ratings & Star reviews
- **Multi-Category Reviews**: Rate real estate agents, architects, realtors, and landlords directly on their cards.
- **Interactive Stars**: Integrated StarRating widget with hover animations, current averages, total counts, and instant status updates.

### 💼 Integrated Escrow & Wallet System
- **Escrow-Protected Deals**: Initiate escrow deals for land/property connections or purchases.
- **Virtual Wallets**: Deposit funds, view transaction histories, track milestone statuses, and release/dispute escrow funds.
- **Transaction Lists**: Full logs detailing deposits, escrows held, receipts, and payouts.

### 👤 Specialized Role-Based Dashboards
- **Buyer Dashboard**: Easily hire verified agents, track escrow transactions, check wallet balances, and upgrade accounts.
- **Realtor / Landlord / Developer Dashboard**: Manage property listings, upload deeds/surveys, track listing views, view subscription status, and access leads analytics.
- **Agent Dashboard (Professional)**: Track client count, total closed deals, pending escrow commissions, total earnings, active chat sessions, and manage service locations.
- **Architect Dashboard (Portfolio)**: Manage design blueprints, view project analytics, check design views, and list layout portfolios.

### 🔐 Multi-Role Registration & Auth
- **Direct Role Selection**: Specialized register screens pre-selected for Buyers, Realtors, Architects, Agents, Landlords, and Developers.
- **Sleek Edit Profile**: Update details, date of birth, addresses, and upload CDN-persisted profile photos.

### 💬 Real-Time Chat & Connection Rooms
- **Instant Messaging**: Real-time chat rooms built on WebSockets to connect buyers directly with agents and sellers.
- **Direct Chat Launcher**: Click to start chats from any expert or property listing page.

### 📰 Platform Blog & Insights
- **Market News**: Public blog listing page with category filters, searches, reading time calculations, and responsive cards.
- **Markdown Articles**: Clean reading layout with headings, lists, authors cards, and related articles sidebar.
- **Dashboard Blog Editor**: Write, edit, save drafts, publish, or feature posts on the home page directly from the Realtor/Staff dashboard.

---

## 🛠️ Technology Stack

- **Core Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/) (with SPA Vercel rewrites configuration)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Design Tokens (Navy, Emerald, Gold)
- **Icons & Typography**: [Lucide React](https://lucide.dev/) + Google Fonts Inter
- **HTTP Client**: [Axios](https://axios-http.com/) with JWT Bearer Token Interceptors and Refresh flows
- **WebSockets**: Native WebSocket API wrapper connecting to Django Channels

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**

### 1. Clone the Repository
```bash
git clone https://github.com/Victormarshall911/real_estate.git
cd real_estate
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8002/api/v1
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch locally at `http://localhost:5173`.

### 5. Production Build
```bash
npm run build
npm run preview
```

---

## 📁 Project Architecture

```text
src/
├── api/              # Axios client configuration & REST API method wrappers
├── components/       # Reusable UI components
│   ├── agent/        # Agent cards, dashboards & location forms
│   ├── architect/    # Architect cards, portfolio dashboards & skeletons
│   ├── auth/         # Login & Register modal interfaces
│   ├── blog/         # Blog management tabs, article forms & editors
│   ├── escrow/       # Transaction lists, escrow forms & deal managers
│   ├── layout/       # Responsive Navbar, Footer & Navigation wrappers
│   ├── profile/      # Edit Profile modals & account settings
│   ├── property/     # Listing galleries, calculators & modals
│   ├── realtor/      # Realtor cards, property manager & listing forms
│   └── shared/       # Network statuses, star rating widgets & loading frames
├── context/          # Global AuthContext & User state management
├── hooks/            # Custom React hooks (useAuth, useScrollReveal)
├── pages/            # Page routing views (Home, Blog, Dashboard, Register, KYC)
└── index.css         # Tailwind utility injections & custom animations
```
