import React, { useEffect, useState } from 'react'

export default function AdminDashboard({ onNavigate }: { onNavigate: (p:string)=>void }) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const res = await fetch('/api/admin-protected')
        if (!mounted) return
        if (res.ok) {
          setAuthorized(true)
        } else {
          setAuthorized(false)
        }
      } catch (err:any) {
        setError(String(err))
      } finally { if (mounted) setLoading(false) }
    }
    check()
    return () => { mounted = false }
  }, [])

  async function logout() {
    await fetch('/api/admin-logout', { method: 'POST' })
    onNavigate('dashboard')
  }

  if (loading) return <div style={{padding:16}}>Checking admin session...</div>
  if (error) return <div style={{padding:16,color:'salmon'}}>Error: {error}</div>
  if (!authorized) {
    return (
      <div style={{padding:16}}>
        <h3>Unauthorized</h3>
        <p>You are not signed in as admin.</p>
        <button className="primary" onClick={() => onNavigate('admin-login')}>Sign in</button>
      </div>
    )
  }

  return (
    <div style={{padding:16}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h2>Admin Dashboard</h2>
        <div>
          <button className="secondary" onClick={logout}>Sign out</button>
        </div>
      </header>

      <section style={{marginTop:12}}>
        <h3>Quick actions</h3>
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          <button className="secondary">View site stats</button>
          <button className="secondary">Manage users</button>
          <button className="secondary">Clear sample data</button>
        </div>
      </section>

      <section style={{marginTop:12}}>
        <h3>Notes</h3>
        <p>This admin area is protected by a server-side password set via the ADMIN_PASSWORD environment variable. For security, do not store the password in the repository.</p>
      </section>
    </div>
  )
}
