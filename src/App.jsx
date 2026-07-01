import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import LandingPage from './pages/LandingPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import DashboardPage from './pages/DashboardPage'
import KYCPage from './pages/KYCPage'
import AgentsPage from './pages/AgentsPage'
import ArchitectsPage from './pages/ArchitectsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import ChatPage from './pages/ChatPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/verify-identity" element={<KYCPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/architects" element={<ArchitectsPage />} />
          <Route path="/pricing" element={<SubscriptionPage />} />
          <Route path="/messages" element={<ChatPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
