import React from 'react'

export default function AttachmentPanel({ attachments, onInsert, onDelete }: { attachments: any[]; onInsert: (a:any)=>void; onDelete: (id:string)=>void }) {
  if (!attachments || attachments.length === 0) return <div className="empty">No attachments</div>
  return (
    <div className="attachment-panel">
      {attachments.map(a => (
        <div className="attachment-item" key={a.id}>
          <div className="thumb">
            {a.type.startsWith('image/') && a.dataUrl ? <img src={a.dataUrl} alt={a.name} /> : <div className="file-icon">📎</div>}
          </div>
          <div className="meta">
            <div className="name">{a.name}</div>
            <div className="type">{a.type || 'file'}</div>
            <div className="extracted">{a.extracted ? (a.extracted.slice(0,120) + (a.extracted.length>120? '...':'')) : 'No extracted text'}</div>
          </div>
          <div className="actions">
            <button onClick={() => onInsert(a)}>Insert</button>
            <a href={a.dataUrl} download={a.name}><button>Download</button></a>
            <button onClick={() => onDelete(a.id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}
