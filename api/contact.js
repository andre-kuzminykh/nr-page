/**
 * The contact widget's messages, delivered to the team by email.
 *
 * A Vercel Function (this file is served at /api/contact). It sends through Resend
 * (https://resend.com) and needs, in the project's environment variables:
 *   RESEND_API_KEY  — the API key (required; without it the widget offers a plain email instead)
 *   CONTACT_TO      — where messages go (default support@neuronium.ai)
 *   CONTACT_FROM    — the sender, on a domain verified in Resend (default Neuronium <hello@neuronium.ai>)
 * The visitor's address is set as Reply-To, so answering the email answers them.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const line = (v, max) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method' })
  }
  const key = process.env.RESEND_API_KEY
  if (!key) return res.status(503).json({ error: 'not-configured' })

  let body = req.body
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    } catch {
      body = null
    }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'invalid' })
  // a hidden field people leave empty: whatever fills it is not a person
  if (body.website) return res.status(200).json({ ok: true })

  const email = line(body.email, 200)
  const subject = line(body.subject, 200)
  const message = String(body.message ?? '').trim().slice(0, 5000)
  if (!EMAIL.test(email) || !subject) return res.status(400).json({ error: 'invalid' })

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || 'Neuronium <hello@neuronium.ai>',
      to: [process.env.CONTACT_TO || 'support@neuronium.ai'],
      reply_to: email,
      subject: `[neuronium.ai] ${subject}`,
      text: `${message || '(no message)'}\n\n— ${email}, from the “Write to us” widget on neuronium.ai`,
    }),
  }).catch(() => null)

  if (!sent || !sent.ok) return res.status(502).json({ error: 'send' })
  return res.status(200).json({ ok: true })
}
