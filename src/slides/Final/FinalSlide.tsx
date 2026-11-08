import { ArrowRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import aitLogo from '../../assets/ait-logo.png'
import { BrandIcon } from '../../components/Brand/BrandIcon'
import { Prompt } from '../../components/Prompt/Prompt'
import { isSlideOpen } from '../../data/slides'
import { useDeck, type SlideProps } from '../../components/SlideController/DeckContext'
import { COMPANY_URL, PRIVACY_URL, SOCIAL, TERMS_URL, taskHref } from '../../config/links'
import './Final.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties
const ext = { target: '_blank', rel: 'noreferrer' } as const
/** The year beside the name at the foot (the current one). */
const YEAR = new Date().getFullYear()

/**
 * The last block: try it yourself — the business task goes into the bar and opens the platform with it.
 * “Contacts” in the menu leads here: the foot holds the company, the socials and the legal pages;
 * writing to the team is the widget in the corner.
 */
export function FinalSlide(_: SlideProps) {
  const { goTo } = useDeck()

  return (
    <div className="slide__frame fin">
      <div className="fin__center">
        <h2 className="fin__title">
          <span className="mask" style={d(80)}>
            <span>Run Your AI Business</span>
          </span>
        </h2>
        <p className="fin__sub rv" style={d(360)}>
          with Neuronium
        </p>

        <div className="fin__bar rv" style={d(480)}>
          <Prompt label="Your business task" placeholder="Describe your business task" href={taskHref} live={false} goEmpty />
        </div>

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
        <div className="fin__brand">
          <a className="fin__by" href={COMPANY_URL} {...ext}>
            <img src={aitLogo} alt="Andre AI Technologies" width={186} height={96} />
          </a>
          <span className="fin__tm">
            Neuronium<sup>®</sup> {YEAR}
          </span>
        </div>

        <ul className="fin__social" aria-label="Neuronium elsewhere">
          {SOCIAL.map((s) => (
            <li key={s.brand}>
              <a className="fin__icon" href={s.href} aria-label={s.label} title={s.label} {...ext}>
                <BrandIcon brand={s.brand} size={s.brand === 'github' ? 16 : 17} />
              </a>
            </li>
          ))}
        </ul>

        <nav className="fin__legal" aria-label="Legal">
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
