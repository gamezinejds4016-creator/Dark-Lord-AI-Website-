export default async function handler(req, res) {
  // Simple serverless proxy for Groq.ai inference API.
  // Ensure GROQ_API_KEY is set in Vercel environment variables (do NOT commit secrets).

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
    res.setHeader('Allow', 'POST')
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  // Read incoming body. Vercel provides req.body when Content-Type is application/json
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

  try {
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const text = await fetchRes.text()
    res.statusCode = fetchRes.status
    // try to set JSON content-type; passthrough whatever the upstream returns
    res.setHeader('Content-Type', 'application/json')
    res.end(text)
  } catch (err) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: String(err) }))
  }
}
