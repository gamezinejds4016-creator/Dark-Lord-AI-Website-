import React, { useEffect, useRef, useState } from 'react'
import { fileToDataUrl, extractFileContent } from '../lib/fileUtils'
import AttachmentPanel from '../components/AttachmentPanel'
import { getAllAttachments, saveAttachment, deleteAttachment } from '../lib/attachmentStore'
import { generateMockImage } from '../lib/imageGen'

type Attachment = { id: string; name: string; type: string; size: number; dataUrl?: string; extracted?: string }
type Message = { id: string; role: 'user' | 'bot'; text: string; attachments?: Attachment[] }

function uid() { return Math.random().toString(36).slice(2, 9) }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let mounted = true
    getAllAttachments().then(list => { if (mounted) setAttachments(list as any[]) }).catch(()=>{})
    // load messages from localStorage
    try{
      const raw = localStorage.getItem('dl_messages')
      if(raw) setMessages(JSON.parse(raw))
    }catch(e){}
    return ()=>{ mounted=false }
  }, [])

  useEffect(() => {
    // persist messages locally
    localStorage.setItem('dl_messages', JSON.stringify(messages))
  }, [messages])

  async function handleFileSelect(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files)
    const newAttachments: Attachment[] = []
    for (const f of arr) {
      const dataUrl = await fileToDataUrl(f)
      const extracted = await extractFileContent(f, dataUrl)
      const att: Attachment = { id: uid(), name: f.name, type: f.type || 'application/octet-stream', size: f.size, dataUrl, extracted }
      newAttachments.push(att)
      try { await saveAttachment(att) } catch(e) { console.warn('saveAttachment failed', e) }
    }
    setAttachments((s) => [...newAttachments, ...s])
  }

  function openFilePicker() { fileInputRef.current?.click() }

  async function send() {
    if (!text.trim() && attachments.length === 0) return
    const userMsg: Message = { id: uid(), role: 'user', text: text.trim(), attachments: attachments }
    setMessages((s) => [...s, userMsg])
    setText('')
    setAttachments([]) // consumed attachments locally
    setLoading(true)

    // Build prompt that includes extracted text from attachments if any
    let prompt = userMsg.text
    if (userMsg.attachments && userMsg.attachments.length) {
      const lines: string[] = ['\n--- Attachments extracted content:']
      for (const a of userMsg.attachments) {
        if (a.extracted) lines.push(`Attachment: ${a.name}\n${a.extracted}\n`)
        else lines.push(`Attachment: ${a.name} (type: ${a.type}, no extracted text available)`)
      }
      prompt += '\n' + lines.join('\n')
    }

    try {
      // mock AI call
      const res = await fetch('/api/ai-proxy', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ prompt }) })
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      const botText = data?.text || JSON.stringify(data)
      const botMsg: Message = { id: uid(), role: 'bot', text: String(botText) }
      setMessages((s) => [...s, botMsg])
    } catch (err:any) {
      const botMsg: Message = { id: uid(), role: 'bot', text: 'Error: ' + (err.message || String(err)) }
      setMessages((s) => [...s, botMsg])
    } finally { setLoading(false) }
  }

  async function handleGenerateImage() {
    const prompt = promptUserForImagePrompt()
    if (!prompt) return
    try {
      setLoading(true)
      const dataUrl = await generateMockImage(prompt, 1024, 576)
      const att = { id: uid(), name: `generated-${Date.now()}.png`, type: 'image/png', size: 0, dataUrl, extracted: `Generated image for prompt: ${prompt}` }
      await saveAttachment(att)
      setAttachments((s) => [att, ...s])
    } catch (err) {
      alert('Image generation failed: ' + String(err))
    } finally { setLoading(false) }
  }

  function promptUserForImagePrompt() {
    const p = prompt('Enter image prompt (mock generator will create a placeholder image):')
    return p ? p.trim() : ''
  }

  async function removeAttachment(id: string) {
    try { await deleteAttachment(id) } catch(e){}
    setAttachments((s) => s.filter(a => a.id !== id))
  }

  function insertAttachmentToComposer(att: Attachment) {
    setText((t) => (t ? t + ' ' : '') + `[Attachment: ${att.name}]`)
  }

  return (
    <div className="chat-page">
      <header className="header">
        <h1>AI Study Assistant</h1>
        <div className="actions">
          <button onClick={() => { if(confirm('Clear all attachments from storage?')) { clearAllLocal() } }}>Clear attachments</button>
        </div>
      </header>

      <main className="main">
        <section className="chat">
          <div className="messages" role="list">
            {messages.map(m => (
              <div key={m.id} className={"message " + m.role} role="listitem">
                <div className="role">{m.role === 'user' ? 'You' : 'Tutor'}</div>
                <div className="text">{m.text}</div>
                {m.attachments && m.attachments.length > 0 && (
                  <div className="message-attachments">
                    {m.attachments.map(a => (
                      <div key={a.id} className="msg-attach">
                        {a.type.startsWith('image/') && a.dataUrl ? (
                          <img src={a.dataUrl} alt={a.name} />
                        ) : (
                          <div className="file-box">{a.name}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="composer">
            <div className="composer-row">
              <button className="attach-btn" title="Attach file" onClick={openFilePicker}>＋</button>
              <input ref={fileInputRef} type="file" style={{display:'none'}} multiple onChange={e => handleFileSelect(e.target.files)} />
              <input value={text} onChange={e => setText(e.target.value)} placeholder="Ask a study question..." onKeyDown={e => e.key === 'Enter' && send()} />
              <button onClick={handleGenerateImage} title="Generate image">🖼️</button>
              <button onClick={send} disabled={loading}>{loading ? 'Thinking...' : 'Send'}</button>
            </div>

            {attachments.length > 0 && (
              <div className="composer-attachments">
                {attachments.map(a => (
                  <div key={a.id} className="composer-attachment">
                    {a.type.startsWith('image/') && a.dataUrl ? <img src={a.dataUrl} alt={a.name} /> : <div className="file-box-small">{a.name}</div>}
                    <div className="composer-attachment-actions">
                      <button onClick={() => insertAttachmentToComposer(a)}>Insert</button>
                      <button onClick={() => removeAttachment(a.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <aside className="sidebar">
          <h3>Attachments</h3>
          <AttachmentPanel attachments={attachments} onInsert={insertAttachmentToComposer} onDelete={(id)=>removeAttachment(id)} />
        </aside>
      </main>

      <footer className="footer">Attachments stored in IndexedDB. No files are uploaded by default.</footer>
    </div>
  )

  function clearAllLocal() {
    // clear attachments from IndexedDB and local state
    import('../lib/attachmentStore').then(mod => mod.clearAllAttachments()).then(() => setAttachments([])).catch(()=>{})
  }
}
