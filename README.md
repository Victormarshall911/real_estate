# 🏙️ LandMarket — Nigeria's Premier Real Estate & Architecture Marketplace

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://landmarketnig.vercel.app)

**LandMarket** is a next-generation real estate and architectural services marketplace tailored specifically for the Nigerian property market. It seamlessly connects property buyers, renters, verified real estate agents, professional realtors, and accredited architects and urban planners on a unified, high-trust digital platform.

🌐 **Live Production Frontend**: [https://landmarketnig.vercel.app](https://landmarketnig.vercel.app)  
🔌 **Backend API Engine**: [https://real-estate-api-orbx.onrender.com/api/v1/](https://real-estate-api-orbx.onrender.com/api/v1/)

---

## ✨ Key Features

### 🏡 Verified Property Directory & Search
- **Advanced Filtering**: Search residential and commercial properties by location, price range, property type, and bedroom count.
- **Dynamic Shimmering Skeletons**: Zero layout shift loading experience across directory and listing views.
- **Interactive Listings**: Rich image galleries, verified badges, direct agent WhatsApp interaction, and instant consultation scheduling.

### 📐 Nigerian Architects & Planners Directory
- **Verified Studios**: Connect directly with accredited architectural firms and urban planners across Nigeria.
- **Portfolio & Specializations**: Filter architects by residential, commercial, industrial, or eco-friendly design specializations.
- **Direct WhatsApp Consultation**: Eliminate middlemen fees with one-click direct consultation via formatted WhatsApp links.

### 🤝 Verified Agents & Realtors Network
- **Trust & Transparency**: Browse verified realtors with track records, reviews, and active listings.
- **Profile Customization**: Dedicated profiles with company details, bio, experience metrics, and direct communication channels.

### 👤 Comprehensive Account & Profile Management
- **Role-Based Onboarding**: Specialized registration flows tailored for Buyers, Realtors, Architects, and Agents.
- **Sleek Edit Profile Modal**: Accessible from any page via the navigation bar to update personal details, date of birth, residential address, and upload profile photos.
- **Persistent Cloud Avatar Storage**: Integrated with Cloudinary for instantaneous profile photo persistence across sessions and page reloads.

---

## 🛠️ Technology Stack

- **Core Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router DOM v6](https://reactrouter.com/) (with SPA Vercel rewrites configuration)
- **Styling & Design System**: [Tailwind CSS](https://tailwindcss.com/) + Custom Design Tokens (Navy `#0f172a`, Emerald `#059669`, Gold `#d97706`)
- **Icons & Typography**: [Lucide React](https://lucide.dev/) + Google Fonts Inter/Plus Jakarta Sans
- **HTTP Client**: [Axios](https://axios-http.com/) with JWT Bearer Token Interceptors and Refresh flows

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm**

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
VITE_API_BASE_URL=https://real-estate-api-orbx.onrender.com/api/v1
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
│   ├── agent/        # Agent cards, directories & skeleton loaders
│   ├── architect/    # Architect directory cards & skeleton grids
│   ├── auth/         # Login & Registration role-specific modals
│   ├── layout/       # Responsive Navbar, Footer & Navigation wrappers
│   ├── profile/      # Edit Profile modal & account management screens
│   └── properties/   # Property listing cards, filters & details
├── context/          # Global AuthContext & User state management
├── hooks/            # Custom React hooks (useAuth, etc.)
├── pages/            # Page routing views (Home, Architects, Agents, Listings)
└── index.css         # Tailwind utility injections & custom animations
```

---

## 📄 License

This project is proprietary and built for the **LandMarket Nigeria** ecosystem. All rights reserved.
