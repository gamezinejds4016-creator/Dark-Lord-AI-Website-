import React from 'react'
import { useLocalStore } from '../hooks/useLocalStore'

export default function Settings() {
  const [provider, setProvider] = useLocalStore<'mock'|'groq'>('dl_ai_provider', 'mock')

  return (
    <div className="settings-page" style={{padding:16}}>
      <h2>Settings</h2>
      <section style={{marginTop:12}}>
        <h3>AI Provider</h3>
        <p className="muted">Choose Mock for development (no API key), or Groq to use the server proxy (requires GROQ_API_KEY in Vercel).</p>
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <button onClick={() => setProvider('mock')} className={provider==='mock' ? 'primary':'secondary'}>Mock (safe)</button>
          <button onClick={() => setProvider('groq')} className={provider==='groq' ? 'primary':'secondary'}>Groq (server)</button>
        </div>
      </section>

      <section style={{marginTop:16}}>
        <h3>Notes</h3>
        <ul>
          <li>Do NOT paste API keys into this settings page. Add keys to Vercel environment variables for production.</li>
          <li>If you select Groq locally, make sure the server proxy has access to GROQ_API_KEY on the server (Vercel).</li>
        </ul>
      </section>
    </div>
  )
}
