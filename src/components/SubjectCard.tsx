import React from 'react'

export default function SubjectCard({ title, onClick }: { title: string; onClick?: ()=>void }) {
  return (
    <button className="subject-card" onClick={onClick} aria-label={title}>
      <div className="subject-icon">📘</div>
      <div className="subject-title">{title}</div>
    </button>
  )
}
