import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import BottomNav from './components/BottomNav'
import Settings from './pages/Settings'
import Admin from './pages/Admin'
import AdminDashboard from './pages/AdminDashboard'
import './styles/index.css'

export default function App() {
  const [route, setRoute] = useState<'dashboard'|'chat'|'practice'|'notes'|'settings'|'admin'|'admin-login'>('dashboard')

  function navigate(to: typeof route) { setRoute(to) }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">🧙‍♂️ <strong>Dark Lord</strong></div>
          <nav className="topnav">
            <button onClick={() => navigate('dashboard')} className={route==='dashboard' ? 'active':''}>Home</button>
            <button onClick={() => navigate('chat')} className={route==='chat' ? 'active':''}>Chat</button>
            <button onClick={() => navigate('practice')} className={route==='practice' ? 'active':''}>Practice</button>
            <button onClick={() => navigate('admin-login')} className={route==='admin' || route==='admin-login' ? 'active':''}>Admin</button>
            <button onClick={() => navigate('settings')} className={route==='settings' ? 'active':''}>Settings</button>
          </nav>
          <div className="avatar">S</div>
        </div>
      </header>

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
        if(p==='admin'){
          navigate('admin-login')
        } else navigate(p)
      }} />
    </div>
  )
}
