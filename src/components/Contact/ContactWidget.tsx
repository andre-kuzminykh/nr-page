import { ArrowUp, Check, Mail, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { CONTACT_ENDPOINT, SUPPORT_EMAIL } from '../../config/links'
import { onOpenContact } from '../../lib/events'
import './Contact.css'

type Status = 'idle' | 'sending' | 'sent' | 'handed' | 'error'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Write to the team from any block: a small button in the bottom-right corner opens a card with
 * the visitor's email, a subject and (if they like) a message. It is sent to the team, and the
 * answer comes by email. Without a working endpoint it says so and offers a plain email instead.
 */
export function ContactWidget() {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [trap, setTrap] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [tried, setTried] = useState(false)
  const launcher = useRef<HTMLButtonElement>(null)
  const first = useRef<HTMLInputElement>(null)
  const card = useRef<HTMLDivElement>(null)

  // “Contact sales” and the like open it with a subject already written in
  useEffect(
    () =>
      onOpenContact((s) => {
        if (s) setSubject((cur) => cur || s)
        setStatus((st) => (st === 'sent' ? 'idle' : st))
        setOpen(true)
      }),
    [],
  )

  // while it is open the deck does not turn on scroll or swipe; Escape closes it
  useEffect(() => {
    const root = document.documentElement
    if (!open) {
      delete root.dataset.contactOpen
      return
    }
    root.dataset.contactOpen = 'true'
    const t = window.setTimeout(() => first.current?.focus({ preventScroll: true }), 60)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (!card.current?.contains(t) && !launcher.current?.contains(t)) setOpen(false)
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onDown)
      delete root.dataset.contactOpen
    }
  }, [open])

  const close = () => {
    setOpen(false)
    launcher.current?.focus({ preventScroll: true })
  }

  const emailOk = EMAIL.test(email.trim())
  const subjectOk = subject.trim().length > 0
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(message.trim())}`

  const send = async (e: FormEvent) => {
    e.preventDefault()
    setTried(true)
    if (!emailOk || !subjectOk || status === 'sending') return
    // a host with no server: the visitor's own mail app sends it, written and addressed
    if (CONTACT_ENDPOINT === 'mailto') {
      const body = [message.trim(), `Reply to: ${email.trim()}`].filter(Boolean).join('\n\n')
      window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject.trim())}&body=${encodeURIComponent(body)}`
      setStatus('handed')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: email.trim(), subject: subject.trim(), message: message.trim(), website: trap }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      setSubject('')
      setMessage('')
      setTried(false)
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className={`cw ${open ? 'is-open' : ''}`}>
      {open && (
        <div ref={card} className="cw__card" role="dialog" aria-modal="false" aria-labelledby={`${id}-t`}>
          <div className="cw__head">
            <div>
              <p id={`${id}-t`} className="cw__title">
                Write to us
              </p>
              <p className="cw__sub">We reply by email.</p>
            </div>
            <button type="button" className="cw__x" aria-label="Close" onClick={close}>
              <X size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>

          {status === 'handed' ? (
            <div className="cw__done" role="status">
              <span className="cw__tick" aria-hidden="true">
                <Check size={18} strokeWidth={2.2} />
              </span>
              <p>
                Your mail app has it ready, to <strong>{SUPPORT_EMAIL}</strong>. Press Send there, and we’ll reply to <strong>{email.trim()}</strong>.
              </p>
              <button type="button" className="cw__again" onClick={() => setStatus('idle')}>
                Back
              </button>
            </div>
          ) : status === 'sent' ? (
            <div className="cw__done" role="status">
              <span className="cw__tick" aria-hidden="true">
                <Check size={18} strokeWidth={2.2} />
              </span>
              <p>
                Sent. We’ll reply to <strong>{email.trim()}</strong>.
              </p>
              <button type="button" className="cw__again" onClick={() => setStatus('idle')}>
                Write another
              </button>
            </div>
          ) : (
            <form className="cw__form" onSubmit={send} noValidate>
              <label className={`cw__field ${tried && !emailOk ? 'is-bad' : ''}`}>
                <span>Your email</span>
                <input
                  ref={first}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  maxLength={200}
                  required
                  value={email}
                  placeholder="you@company.com"
                  aria-invalid={tried && !emailOk}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className={`cw__field ${tried && !subjectOk ? 'is-bad' : ''}`}>
                <span>Subject</span>
                <input
                  type="text"
                  name="subject"
                  maxLength={200}
                  required
                  value={subject}
                  placeholder="What is it about?"
                  aria-invalid={tried && !subjectOk}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </label>
              <label className="cw__field">
                <span>
                  Message <em>optional</em>
                </span>
                <textarea name="message" rows={3} maxLength={5000} value={message} onChange={(e) => setMessage(e.target.value)} />
              </label>
              {/* left empty by people; bots fill it */}
              <input className="cw__trap" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} />

              <p className="cw__status" aria-live="polite">
                {tried && (!emailOk || !subjectOk)
                  ? !emailOk
                    ? 'Add the email we should reply to.'
                    : 'Add a subject.'
                  : status === 'error' && (
                      <>
                        Couldn’t send it right now. Write to <a href={mailto}>{SUPPORT_EMAIL}</a> instead.
                      </>
                    )}
              </p>

              <button type="submit" className="cw__send" disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending…' : 'Send'}
                <ArrowUp size={15} strokeWidth={2} aria-hidden="true" />
              </button>
            </form>
          )}
        </div>
      )}

      <button
        ref={launcher}
        type="button"
        className="cw__launch"
        aria-expanded={open}
        aria-label={open ? 'Close the message form' : 'Write to us'}
        onClick={() => (open ? close() : setOpen(true))}
      >
        {open ? <X size={18} strokeWidth={1.8} aria-hidden="true" /> : <Mail size={18} strokeWidth={1.7} aria-hidden="true" />}
        <span className="cw__label" aria-hidden="true">
          Write to us
        </span>
      </button>
    </div>
  )
}
