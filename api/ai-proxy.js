export default async function handler(req, res) {
  // Mock-only server proxy. This endpoint does not call any external AI provider.
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

  const prompt = body.prompt || ''
  const subject = body.subject || ''
  const subjectNote = subject ? ` (Subject: ${subject})` : ''
  const text = `Sure — here's a simple explanation${subjectNote}:\n\n` +
    `1) Short explanation: This is a concise explanation for the prompt.\n\n` +
    `2) Step-by-step idea: Break the concept into parts and explain each part.\n\n` +
    `3) Example: Provide a simple example illustrating the idea.\n\n` +
    `Ask for a simpler version, more examples, or practice questions.`

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ text }))
}
