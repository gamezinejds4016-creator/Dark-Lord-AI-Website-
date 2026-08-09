// api/admin-protected.js
// Verifies the admin cookie and returns basic admin info if valid.

export default async function handler(req, res) {
  const crypto = require('crypto')

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }

  const cookies = (req.headers && req.headers.cookie) || ''
  const match = cookies.split(';').map(s=>s.trim()).find(s => s.startsWith('dl_admin='))
  if (!match) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'No admin session' }))
    return
  }

  const token = match.split('=')[1]
  if (!token) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid token' }))
    return
  }

  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'please-set-admin-secret'
  try {
    const [b64, sig] = token.split('.')
    const payload = Buffer.from(b64, 'base64').toString('utf8')
    const expected = crypto.createHmac('sha256', ADMIN_SECRET).update(payload).digest('hex')
    if (expected !== sig) throw new Error('bad sig')
    const obj = JSON.parse(payload)
    if (obj.role !== 'admin') throw new Error('not admin')

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: true, info: { role: 'admin', ts: obj.ts } }))
  } catch (err:any) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Invalid admin session' }))
  }
}
