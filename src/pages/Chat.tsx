import React, { useEffect, useState } from 'react'

type Message = { id: string; role: 'user' | 'bot'; text: string }

const LS_KEY = 'dl_messages'

function uid() { return Math.random().toString(36).slice(2, 9) }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try { const raw = localStorage.getItem(LS_KEY); return raw ? JSON.parse(raw) : [] } catch { return [] }
  })
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [flashcards, setFlashcards] = useState<Array<{id:string,front:string,back:string}>>(() => {
    try { const raw = localStorage.getItem('dl_flashcards'); return raw ? JSON.parse(raw) : [] } catch { return [] }
  })

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(messages)) }, [messages])
  useEffect(() => { localStorage.setItem('dl_flashcards', JSON.stringify(flashcards)) }, [flashcards])

  async function send() {
    if (!text.trim()) return
    const userMsg: Message = { id: uid(), role: 'user', text: text.trim() }
    setMessages((s) => [...s, userMsg])
    setText('')
    setLoading(true)
    try {
      const res = await fetch('/api/ai-proxy', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ prompt: userMsg.text }) })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      const botText = (data?.output) || (data?.text) || JSON.stringify(data)
      const botMsg: Message = { id: uid(), role: 'bot', text: String(botText) }
      setMessages((s) => [...s, botMsg])
    } catch (err:any) {
      const botMsg: Message = { id: uid(), role: 'bot', text: 'Error: ' + (err.message || String(err)) }
      setMessages((s) => [...s, botMsg])
    } finally { setLoading(false) }
  }

  function saveAsFlashcard(m: Message) {
    if (m.role !== 'bot') return
    const card = { id: uid(), front: m.text.slice(0, 80), back: m.text }
    setFlashcards((s) => [card, ...s])
    alert('Saved as flashcard')
  }

  function exportData() {
    const data = { messages, flashcards }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'dark-lord-data.json'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="chat-page">
      <header className="header">
        <h1>AI Study Assistant</h1>
        <div className="actions">
          <button onClick={exportData}>Export</button>
        </div>
      </header>

      <main className="main">
        <section className="chat">
          <div className="messages" role="list">
            {messages.map(m => (
              <div key={m.id} className={"message " + m.role} role="listitem">
                <div className="role">{m.role === 'user' ? 'You' : 'Tutor'}</div>
                <div className="text">{m.text}</div>
                {m.role === 'bot' && <button className="save" onClick={() => saveAsFlashcard(m)}>Save as flashcard</button>}
              </div>
            ))}
          </div>

          <div className="composer">
            <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask a study question..." onKeyDown={e => e.key === 'Enter' && send()} />
            <button onClick={send} disabled={loading}>{loading ? 'Thinking...' : 'Send'}</button>
          </div>
        </section>

        <aside className="sidebar">
          <h3>Flashcards</h3>
          <div className="cards">
            {flashcards.length === 0 && <div className="empty">No flashcards yet</div>}
            {flashcards.map(c => (
              <details key={c.id} className="card">
                <summary>{c.front}</summary>
                <div className="back">{c.back}</div>
              </details>
            ))}
          </div>
        </aside>
      </main>

      <footer className="footer">Everything is stored locally. Set up GROQ_API_KEY in Vercel to enable AI.</footer>
    </div>
  )
}
