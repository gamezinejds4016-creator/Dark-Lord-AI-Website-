import React from 'react'
import SubjectCard from '../components/SubjectCard'
import { useLocalStore } from '../hooks/useLocalStore'

export default function Dashboard({ onNavigate }: { onNavigate: (p:string)=>void }) {
  const [messages] = useLocalStore('dl_messages', []) as [any[], any]
  const [flashcards] = useLocalStore('dl_flashcards', []) as [any[], any]
  const [goals, setGoals] = useLocalStore('dl_goals', [{ id: 'g1', text: 'Study math for 30 min', done: false }]) as [any[], any]

  function startChatWithSubject(subject: string) {
    // TODO: pre-select subject in chat (future)
    onNavigate('chat')
  }

  function toggleGoal(id: string) {
    setGoals(goals.map(g => g.id === id ? { ...g, done: !g.done } : g))
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Welcome, Student 👋</h2>
        <p>Ready to learn? Your AI Study Assistant is here to help.</p>
        <div className="cta-row">
          <button className="primary" onClick={() => onNavigate('chat')}>Open AI Study Assistant</button>
          <button className="secondary" onClick={() => onNavigate('practice')}>Start Practice</button>
        </div>
      </header>

      <section className="subjects">
        <h3>Subjects</h3>
        <div className="subject-list">
          {['Mathematics','Physics','Chemistry','Biology','English','Social Science','Information Technology'].map(s => (
            <SubjectCard key={s} title={s} onClick={() => startChatWithSubject(s)} />
          ))}
        </div>
      </section>

      <section className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-row">
          <button onClick={() => onNavigate('practice')}>Start Quiz</button>
          <button onClick={() => onNavigate('notes')}>Upload Notes</button>
          <button onClick={() => onNavigate('chat')}>Revision Mode</button>
        </div>
      </section>

      <section className="today-goals">
        <h3>Today's Goals</h3>
        <ul>
          {goals.map((g:any) => (
            <li key={g.id} className={g.done ? 'done':''}>
              <label>
                <input type="checkbox" checked={!!g.done} onChange={() => toggleGoal(g.id)} />
                <span>{g.text}</span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="recent-list">
          {messages.slice(-3).reverse().map(m => (
            <div className="recent-item" key={m.id}><strong>{m.role==='user'? 'You': 'Tutor'}:</strong> {m.text.slice(0,80)}</div>
          ))}
          {flashcards.slice(0,3).map(f => (
            <div className="recent-item" key={f.id}><strong>Flashcard:</strong> {f.front}</div>
          ))}
          {messages.length===0 && flashcards.length===0 && <div className="empty">No recent activity</div>}
        </div>
      </section>
    </div>
  )
}
