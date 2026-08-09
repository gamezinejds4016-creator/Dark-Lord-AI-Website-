import React from 'react'
import { useLocalStore } from '../hooks/useLocalStore'

export default function Settings() {
  // Mock-only mode — external providers removed
  const [mode] = useLocalStore<'mock'>('dl_ai_mode', 'mock')

  return (
    <div className="settings-page" style={{padding:16}}>
      <h2>Settings</h2>
      <section style={{marginTop:12}}>
        <h3>AI Mode</h3>
        <p className="muted">This app runs in Mock mode only (no external AI providers). Mock mode returns helpful tutor-style responses so you can continue developing and testing without API keys.</p>
      </section>

      <section style={{marginTop:16}}>
        <h3>Notes</h3>
        <ul>
          <li>No Groq or other external AI integration is included in this build.</li>
          <li>Do NOT paste API keys into this settings page. If you later add a provider, store keys in environment variables on the server.</li>
        </ul>
      </section>
    </div>
  )
}
