import React, { useState } from 'react'

export default function Admin({ onNavigate }: { onNavigate: (p:string)=>void }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(e?:React.FormEvent) {
    e?.preventDefault()
    setError(null)
    if (!password) { setError('Enter password'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/admin-login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ password }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Login failed')
      // on success server sets HttpOnly cookie. Navigate to admin dashboard which will verify.
      onNavigate('admin')
    } catch (err:any) {
      setError(err.message || String(err))
    } finally { setLoading(false) }
  }

  return (
    <div style={{padding:16}}>
      <h2>Admin Login</h2>
      <p className="muted">Enter the administrator password. Passwords containing extremist or hateful content are not allowed.</p>
      <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:8,maxWidth:420}}>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin password" />
        <div style={{display:'flex',gap:8}}>
          <button type="submit" className="primary" disabled={loading}>{loading?'Signing in...':'Sign in'}</button>
          <button type="button" className="secondary" onClick={() => onNavigate('dashboard')}>Cancel</button>
        </div>
        {error && <div style={{color:'salmon'}}>{error}</div>}
      </form>
    </div>
  )
}
