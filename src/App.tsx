import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import BottomNav from './components/BottomNav'
import './styles/index.css'

export default function App() {
  const [route, setRoute] = useState<'dashboard'|'chat'|'practice'|'notes'|'settings'>('dashboard')

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
        {route === 'settings' && (
          <div className="placeholder">Settings (coming soon)</div>
        )}
      </main>

      <BottomNav active={route} onNavigate={navigate} />
    </div>
  )
}
