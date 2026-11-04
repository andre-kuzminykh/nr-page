import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useRef, useState, type CSSProperties, type FormEvent } from 'react'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { COMPANY_URL, CONTACT_EMAIL, IDEA_ENDPOINT, MEDIA_LABEL_URL, ideaMailto } from '../../config/links'
import './Final.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
type Status = 'idle' | 'short' | 'sending' | 'sent' | 'mail' | 'error'

/** Final CTA — write the idea straight into the input. The light does the rest. */
export function FinalSlide(_: SlideProps) {
  const { goTo } = useDeck()
  const [idea, setIdea] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const input = useRef<HTMLTextAreaElement>(null)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const text = idea.trim()
    if (text.length < 3) {
      setStatus('short')
      input.current?.focus()
      return
    }
    if (!IDEA_ENDPOINT) {
      window.location.href = ideaMailto(text)
      setStatus('mail')
      return
    }
    setStatus('sending')
    try {
      const res = await fetch(IDEA_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: text, source: 'neuronium-landing' }),
      })
      if (!res.ok) throw new Error(String(res.status))
      setStatus('sent')
      setIdea('')
    } catch {
      setStatus('error')
    }
  }

  const message: Record<Status, string> = {
    idle: '',
    short: 'Write a few words about your idea first.',
    sending: 'Sending…',
    sent: 'Thank you — your idea has reached the Neuronium team.',
    mail: `Your email app should open with the idea. If it doesn’t, write to ${CONTACT_EMAIL}.`,
    error: `Couldn’t send right now. Please write to ${CONTACT_EMAIL}.`,
  }

  return (
    <div className="slide__frame fin">
      <div className="fin__center">
        <h2 className="fin__title">
          <span className="mask" style={d(80)}>
            <span>Turn your Idea</span>
          </span>
          <span className="mask" style={d(170)}>
            <span>into Reality.</span>
          </span>
        </h2>
        <p className="fin__sub rv rv--blur" style={d(360)}>
          Run AI Business with Neuronium.
        </p>

        <form className={`fin__form rv fin__form--${status}`} style={d(480)} onSubmit={submit}>
          <label htmlFor="fin-idea" className="sr-only">
            Your idea
          </label>
          <textarea
            id="fin-idea"
            ref={input}
            rows={1}
            value={idea}
            maxLength={2000}
            placeholder="Describe your idea — a product, a service, a business…"
            onChange={(e) => {
              setIdea(e.target.value)
              if (status !== 'idle' && status !== 'sending') setStatus('idle')
              const el = e.target
              el.style.height = ''
              if (el.scrollHeight > el.clientHeight) el.style.height = `${Math.min(el.scrollHeight, 120)}px`
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            aria-describedby="fin-status"
          />
          <button type="submit" className="btn btn--primary fin__submit" disabled={status === 'sending'}>
            Get Early Access
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </form>
        <p id="fin-status" className={`fin__status rv rv--fade is-${status}`} style={d(560)} aria-live="polite">
          {message[status]}
        </p>

        <button type="button" className="text-link fin__explore rv rv--fade" style={d(640)} onClick={() => goTo('employees')}>
          Explore AI Employees
          <ArrowRight size={13} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>

      <footer className="fin__foot rv rv--fade" style={d(800)}>
        <span>Neuronium</span>
        <span className="fin__sep" aria-hidden="true">·</span>
        <span>
          A{' '}
          <a href={MEDIA_LABEL_URL} target="_blank" rel="noreferrer">
            Dataist AI
          </a>{' '}
          label
        </span>
        <span className="fin__sep" aria-hidden="true">·</span>
        <span>
          Technology by{' '}
          <a href={COMPANY_URL} target="_blank" rel="noreferrer">
            Andre AI Technologies
          </a>
        </span>
      </footer>
    </div>
  )
}
