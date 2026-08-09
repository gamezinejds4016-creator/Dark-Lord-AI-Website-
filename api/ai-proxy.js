export default async function handler(req, res) {
  // Enhanced serverless proxy: supports provider flag and 'mock' fallback
  const url = process.env.GROQ_API_URL || 'https://api.groq.ai/v1/models/groq-1.0/infer'

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  let body
  try {
    if (req.body) body = req.body
    else {
      let raw = ''
      for await (const chunk of req) raw += chunk
      body = raw ? JSON.parse(raw) : {}
    }
  } catch (err) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid JSON body' }))
    return
  }

  const provider = body.provider || 'groq'
  const prompt = body.prompt || ''
  const subject = body.subject || ''

  if (provider === 'mock') {
    // Return a deterministic mock tutor-style response
    const subjectNote = subject ? ` (Subject: ${subject})` : ''
    const text = `Sure — here's a simple explanation${subjectNote}:\n\n` +
      `1) Short explanation: This is a concise explanation for the prompt.\n\n` +
      `2) Step-by-step idea: Break the concept into parts and explain each part.\n\n` +
      `3) Example: Provide a simple example illustrating the idea.\n\n` +
      `Ask for a simpler version, more examples, or practice questions.`

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ text }))
    return
  }

  // For groq provider, forward the request to the Groq inference API
  const key = process.env.GROQ_API_KEY
  if (!key) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'GROQ_API_KEY not configured on server (Vercel).' }))
    return
  }

  try {
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt, subject })
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
