// The contact widget's function (api/contact.js), called with stand-ins for Vercel's request and
// response and for the email provider: nothing is sent anywhere.
const { default: handler } = await import('../api/contact.js')
let failed = 0
const call = async (method, body, env = {}) => {
  Object.assign(process.env, { RESEND_API_KEY: '', ...env })
  let out = { status: 0, json: null, headers: {} }
  const res = { status(c) { out.status = c; return this }, json(j) { out.json = j; return this }, setHeader(k, v) { out.headers[k] = v } }
  await handler({ method, body }, res)
  return out
}
const sent = []
globalThis.fetch = async (url, init) => { sent.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization }); return { ok: true } }
const ok = (name, cond, detail) => {
  if (!cond) failed++
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`)
}
let r = await call('GET'); ok('GET → 405', r.status === 405 && r.headers.Allow === 'POST')
r = await call('POST', { email: 'a@b.co', subject: 'Hi' }); ok('no key → 503', r.status === 503 && sent.length === 0)
r = await call('POST', { email: 'nope', subject: 'Hi' }, { RESEND_API_KEY: 'k' }); ok('bad email → 400', r.status === 400)
r = await call('POST', { email: 'a@b.co', subject: '' }, { RESEND_API_KEY: 'k' }); ok('no subject → 400', r.status === 400)
r = await call('POST', { email: 'a@b.co', subject: 'Hi', website: 'spam' }, { RESEND_API_KEY: 'k' }); ok('honeypot → 200, nothing sent', r.status === 200 && sent.length === 0)
r = await call('POST', JSON.stringify({ email: 'anna@example.com', subject: 'Scale\r\nBcc: x@y.z', message: 'We are 25.' }), { RESEND_API_KEY: 'k' })
ok('valid (string body) → 200, one email', r.status === 200 && sent.length === 1, JSON.stringify(sent[0]?.body))
ok('reply-to is the visitor, subject has no line breaks, to support', sent[0].body.reply_to === 'anna@example.com' && !/[\r\n]/.test(sent[0].body.subject) && sent[0].body.to[0] === 'support@neuronium.ai' && sent[0].auth === 'Bearer k')
globalThis.fetch = async () => ({ ok: false })
r = await call('POST', { email: 'a@b.co', subject: 'Hi' }, { RESEND_API_KEY: 'k' }); ok('provider fails → 502', r.status === 502)
globalThis.fetch = async () => { throw new Error('net') }
r = await call('POST', { email: 'a@b.co', subject: 'Hi' }, { RESEND_API_KEY: 'k' }); ok('network error → 502', r.status === 502)

console.log(failed ? `\n${failed} check(s) failed` : '\nContact function: all checks passed')
process.exit(failed ? 1 : 0)
