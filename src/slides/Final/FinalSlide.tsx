import { ArrowRight, ArrowUpRight, Mail } from 'lucide-react'
import { useState, type CSSProperties, type FormEvent } from 'react'
import aitLogo from '../../assets/ait-logo.png'
import { BrandIcon } from '../../components/Brand/BrandIcon'
import { isSlideOpen } from '../../data/slides'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { COMPANY_URL, PRIVACY_URL, SOCIAL, SUPPORT_EMAIL, TERMS_URL, taskHref } from '../../config/links'
import './Final.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const ext = { target: '_blank', rel: 'noreferrer' } as const

/**
 * Final CTA — write the business task straight into the input and it opens the platform with it.
 * “Contacts” in the menu leads here: the foot holds the company, the socials, support and the legal pages.
 */
export function FinalSlide(_: SlideProps) {
  const { goTo } = useDeck()
  const [idea, setIdea] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    window.location.assign(taskHref(idea))
  }

  return (
    <div className="slide__frame fin">
      <div className="fin__center">
        <h2 className="fin__title">
          <span className="mask" style={d(80)}>
            <span>Run Your AI Business</span>
          </span>
        </h2>
        <p className="fin__sub rv rv--blur" style={d(360)}>
          with Neuronium
        </p>

        <form className="fin__form rv" style={d(480)} onSubmit={submit}>
          <label htmlFor="fin-idea" className="sr-only">
            Your business task
          </label>
          <textarea
            id="fin-idea"
            rows={1}
            value={idea}
            maxLength={2000}
            placeholder="Describe your business task"
            onChange={(e) => {
              setIdea(e.target.value)
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
          />
          <button type="submit" className="btn btn--primary fin__submit">
            Get Early Access
            <ArrowUpRight size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </form>

        {/* the table opens later; until then the link has nowhere to go */}
        {isSlideOpen('employees') && (
          <button
            type="button"
            className="text-link fin__explore rv rv--fade"
            style={d(640)}
            onClick={() => goTo('employees')}
          >
            Explore AI Employees
            <ArrowRight size={13} strokeWidth={1.8} aria-hidden="true" />
          </button>
        )}
      </div>

      <footer className="fin__foot rv rv--fade" style={d(800)}>
        <a className="fin__by" href={COMPANY_URL} {...ext}>
          <span>Created by</span>
          <img src={aitLogo} alt="Andre AI Technologies" width={186} height={96} />
        </a>

        <ul className="fin__social" aria-label="Neuronium elsewhere">
          {SOCIAL.map((s) => (
            <li key={s.brand}>
              <a
                className={`fin__icon ${s.brand === 'github' ? 'fin__icon--oss' : ''}`}
                href={s.href}
                aria-label={s.label}
                title={s.label}
                {...ext}
              >
                <BrandIcon brand={s.brand} size={s.brand === 'github' ? 16 : 17} />
                {s.brand === 'github' && <span>Open source</span>}
              </a>
            </li>
          ))}
        </ul>

        <nav className="fin__legal" aria-label="Support and legal">
          <a href={`mailto:${SUPPORT_EMAIL}`}>
            <Mail size={13} strokeWidth={1.8} aria-hidden="true" />
            {SUPPORT_EMAIL}
          </a>
          <a href={TERMS_URL} {...ext}>
            Terms of Use
          </a>
          <a href={PRIVACY_URL} {...ext}>
            Privacy Policy
          </a>
        </nav>
      </footer>
    </div>
  )
}
