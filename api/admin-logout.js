// api/admin-logout.js
// Clears the admin cookie
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Allow', 'POST')
    res.end(JSON.stringify({ error: 'Method Not Allowed' }))
    return
  }
  // Clear cookie by setting Max-Age=0
  res.setHeader('Set-Cookie', `dl_admin=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`)
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify({ ok: true }))
}
