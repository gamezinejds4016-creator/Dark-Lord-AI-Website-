// api/admin-login.js
// Server-side admin login: compares posted password to ADMIN_PASSWORD env var and sets an HttpOnly cookie if valid.

export default async function handler(req, res) {
  const crypto = require('crypto')

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

  const provided = String(body.password || '')
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'please-set-admin-secret'

  // Security: do not accept passwords containing extremist or hateful content.
  const banned = ['hitler', 'nazi', 'heil', 'ss', 'sieg']
  const low = (provided + (ADMIN_PASSWORD || '')).toLowerCase()
  for (const b of banned) {
    if (low.includes(b)) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Admin password contains disallowed content' }))
      return
    }
  }

  if (!ADMIN_PASSWORD) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'ADMIN_PASSWORD not configured on server. Set ADMIN_PASSWORD in environment.' }))
    return
  }

  if (provided !== ADMIN_PASSWORD) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid password' }))
    return
  }

  // create a small signed token: base64(payload).signature
  const payload = JSON.stringify({ role: 'admin', ts: Date.now() })
  const sig = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex')
  const token = Buffer.from(payload).toString('base64') + '.' + sig

  // set HttpOnly cookie
  const cookie = `dl_admin=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Lax; Secure`
  res.setHeader('Set-Cookie', cookie)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true }))
}
