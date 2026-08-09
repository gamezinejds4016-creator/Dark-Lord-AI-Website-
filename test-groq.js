#!/usr/bin/env node
// test-groq.js
// Simple Node script to test the Groq.ai inference API using GROQ_API_KEY from environment.
// Usage:
//   GROQ_API_KEY=sk_live_... node test-groq.js "Explain the Pythagorean theorem simply"

const prompt = process.argv.slice(2).join(' ') || 'Explain the Pythagorean theorem simply for a 10-year-old.'
const key = process.env.GROQ_API_KEY
const url = process.env.GROQ_API_URL || 'https://api.groq.ai/v1/models/groq-1.0/infer'

if (!key) {
  console.error('Error: GROQ_API_KEY not set in environment.');
  console.error('Set it with: export GROQ_API_KEY=your_key_here (macOS / Linux)');
  process.exit(1);
}

;(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({ prompt })
    })

    const text = await res.text()
    console.log('HTTP', res.status)
    console.log(text)
  } catch (err) {
    console.error('Request error:', err)
    process.exit(1)
  }
})()
