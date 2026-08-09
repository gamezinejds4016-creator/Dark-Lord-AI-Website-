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
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-badge">The Most Powerful AI Assistant</div>
          <h1 className="hero-title">Dark Lord<br/>Your Ultimate<br/>Study Companion</h1>
          <p className="hero-sub">The most powerful AI assistant that can help with absolutely anything. From homework and exams to coding, research, writing, and creative projects. Upload images, files, links — Dark Lord handles it all.</p>
          <div className="hero-cta">
            <button className="primary" onClick={() => onNavigate('chat')}>Start Chatting →</button>
            <button className="secondary" onClick={() => onNavigate('practice')}>Practice Questions</button>
          </div>
        </div>
      </section>

      <section className="about-card">
        <div className="card-inner">
          <div className="card-badge">About My Creator</div>
          <h2 className="card-title">THE DARK LORD RETURNS</h2>
          <p className="card-quote">"Every legend has an origin. Every prophecy has a chosen name."</p>

          <div className="creator-name">Deekshith Srivastav Jhade</div>

          <div className="attributes">
            <div className="attr">A seeker of knowledge.</div>
            <div className="attr">A master of strategy.</div>
            <div className="attr">A mind driven by curiosity.</div>
            <div className="attr">A soul determined to forge its own destiny.</div>
          </div>

          <p className="card-footer">Not born to follow legends... But to create one.</p>
        </div>
      </section>

      <section className="subjects">
        <h3>Subjects</h3>
        <div className="subject-list">
          {['Mathematics','Physics','Chemistry','Biology','English','Social Science','Information Technology'].map(s => (
            <SubjectCard key={s} title={s} onClick={() => startChatWithSubject(s)} />
          ))}
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
