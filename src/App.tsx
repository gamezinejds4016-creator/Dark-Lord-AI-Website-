import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import BottomNav from './components/BottomNav'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import './styles/index.css'

export default function App() {
  const [route, setRoute] = useState<'dashboard'|'chat'|'practice'|'notes'|'settings'|'admin'>('dashboard')

  function navigate(to: typeof route) { setRoute(to) }

  return (
    <div className="app-shell">
      <main className="page-container">
        {route === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {route === 'chat' && <Chat />}
        {route === 'practice' && (
          <div className="placeholder">Practice section (coming soon)</div>
        )}
        {route === 'notes' && (
          <div className="placeholder">Notes section (coming soon)</div>
        )}
        {route === 'settings' && <Settings />}
        {route === 'admin' && <AdminDashboard onNavigate={navigate} />}
        {route === 'admin-login' && <Admin onNavigate={navigate} />}
      </main>

      <BottomNav active={route} onNavigate={(p:any)=>{
        // allow Admin login to be reached via nav
        if(p==='admin'){
          // navigate to login page first
          navigate('admin-login')
        } else navigate(p)
      }} />
    </div>
  )
}
