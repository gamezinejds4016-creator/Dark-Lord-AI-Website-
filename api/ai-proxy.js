// Simple Vercel-style serverless proxy for Groq.ai (example)
// WARNING: Do not commit your API keys. Set GROQ_API_KEY in environment.

module.exports = async (req, res) => {
  const key = process.env.GROQ_API_KEY
  const url = process.env.GROQ_API_URL || 'https://api.groq.ai/v1/models/groq-1.0/infer'

  if (!key) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'GROQ_API_KEY not set in environment' }))
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.end('Method Not Allowed')
    return
  }

  let body = ''
  for await (const chunk of req) body += chunk

  try {
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body
    })

    const text = await fetchRes.text()
    res.statusCode = fetchRes.status
    res.setHeader('Content-Type', 'application/json')
    res.end(text)
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: String(err) }))
  }
}
