import React from 'react'

export default function BottomNav({ active, onNavigate }: { active: string; onNavigate: (p:string)=>void }) {
  return (
    <nav className="bottom-nav" aria-label="Main Navigation">
      <button className={"nav-item " + (active==='dashboard' ? 'active':'' )} onClick={() => onNavigate('dashboard')}>Home</button>
      <button className={"nav-item " + (active==='chat' ? 'active':'' )} onClick={() => onNavigate('chat')}>Chat</button>
      <button className={"nav-item " + (active==='practice' ? 'active':'' )} onClick={() => onNavigate('practice')}>Practice</button>
      <button className={"nav-item " + (active==='notes' ? 'active':'' )} onClick={() => onNavigate('notes')}>Notes</button>
      <button className={"nav-item " + (active==='settings' ? 'active':'' )} onClick={() => onNavigate('settings')}>More</button>
    </nav>
  )
}
