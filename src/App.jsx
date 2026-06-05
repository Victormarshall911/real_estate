import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import DashboardPage from './pages/DashboardPage'
import KYCPage from './pages/KYCPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/verify-identity" element={<KYCPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
