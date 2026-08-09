import React, { useEffect, useRef, useState } from 'react'
import { fileToDataUrl, extractFileContent } from '../lib/fileUtils'
import AttachmentPanel from '../components/AttachmentPanel'
import { useLocalStore } from '../hooks/useLocalStore'
import { sendPrompt } from '../lib/ai'

type Attachment = { id: string; name: string; type: string; size: number; dataUrl?: string; extracted?: string }
type Message = { id: string; role: 'user' | 'bot'; text: string; attachments?: Attachment[] }

const LS_KEY = 'dl_messages'

function uid() { return Math.random().toString(36).slice(2, 9) }

export default function Chat() {
  const [messages, setMessages] = useLocalStore<Message[]>(LS_KEY, [])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [attachments, setAttachments] = useLocalStore<Attachment[]>('dl_attachments', [])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => { /* migrate old flashcards if present - removed elsewhere */ }, [])

  async function handleFileSelect(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files)
    const newAttachments: Attachment[] = []
    for (const f of arr) {
      const dataUrl = await fileToDataUrl(f)
      const extracted = await extractFileContent(f, dataUrl)
      newAttachments.push({ id: uid(), name: f.name, type: f.type || 'application/octet-stream', size: f.size, dataUrl, extracted })
    }
    setAttachments((s) => [...newAttachments, ...s])
  }

  function openFilePicker() { fileInputRef.current?.click() }

  async function send() {
    if (!text.trim() && attachments.length === 0) return
    const userMsg: Message = { id: uid(), role: 'user', text: text.trim(), attachments: attachments }
    setMessages((s) => [...s, userMsg])
    setText('')
    setAttachments([]) // consumed attachments
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
      const res = await sendPrompt(prompt, '')
      if (!res.ok) throw new Error(res.error || 'AI error')
      const botMsg: Message = { id: uid(), role: 'bot', text: String(res.text) }
      setMessages((s) => [...s, botMsg])
    } catch (err:any) {
      const botMsg: Message = { id: uid(), role: 'bot', text: 'Error: ' + (err.message || String(err)) }
      setMessages((s) => [...s, botMsg])
    } finally { setLoading(false) }
  }

  function removeAttachment(id: string) {
    setAttachments((s) => s.filter(a => a.id !== id))
  }

  function insertAttachmentToComposer(att: Attachment) {
    // Temporarily add preview text; user must press send
    setText((t) => (t ? t + ' ' : '') + `[Attachment: ${att.name}]`)
  }

  return (
    <div className="chat-page">
      <header className="header">
        <h1>AI Study Assistant</h1>
        <div className="actions">
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

      <footer className="footer">Attachments are stored locally in your browser. No files are uploaded.</footer>
    </div>
  )
}
