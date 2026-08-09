// api/fetch-url.js
// Server-side URL fetcher for safe link previews. Fetches headers and a small HTML snippet (title & meta description).

export default async function handler(req, res) {
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

  const url = body.url
  if (!url) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Missing url' }))
    return
  }

  try {
    // Basic validation: only http/https
    if (!/^https?:\/\//i.test(url)) throw new Error('Invalid URL')
    const fetchRes = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'DarkLordBot/1.0' }, redirect: 'follow' })
    const ct = fetchRes.headers.get('content-type') || ''
    const text = await fetchRes.text()

    // Very small parse to extract <title> and meta description without a full DOM
    let title = ''
    let desc = ''
    const tMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i)
    if (tMatch) title = tMatch[1].trim()
    const dMatch = text.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i)
    if (dMatch) desc = dMatch[1].trim()

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: true, title, description: desc, contentType: ct }))
  } catch (err:any) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: String(err) }))
  }
}
