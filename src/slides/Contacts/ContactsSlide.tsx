import { ArrowUpRight } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { SlideProps } from '../../components/SlideController/DeckContext'
import { COMPANY_URL, CONTACT_EMAIL, MEDIA_LABEL_URL } from '../../config/links'
import './Contacts.css'

const d = (ms: number) => ({ '--d': ms }) as CSSProperties

/** The last block: how to reach the team, and who stands behind Neuronium. */
export function ContactsSlide(_: SlideProps) {
  return (
    <div className="slide__frame ct">
      <div className="ct__main">
        <h2 className="h2 ct__title">
          <span className="mask" style={d(40)}>
            <span>Contacts</span>
          </span>
        </h2>
        <a className="ct__mail rv" style={d(260)} href={`mailto:${CONTACT_EMAIL}`}>
          <span className="ct__mail-text">{CONTACT_EMAIL}</span>
          <span className="ct__mail-go" aria-hidden="true">
            <ArrowUpRight size={22} strokeWidth={1.8} />
          </span>
        </a>
      </div>

      <footer className="ct__foot rv rv--fade" style={d(520)}>
        <span>Neuronium</span>
        <span className="ct__sep" aria-hidden="true">
          ·
        </span>
        <span>
          A{' '}
          <a href={MEDIA_LABEL_URL} target="_blank" rel="noreferrer">
            Dataist AI
          </a>{' '}
          label
        </span>
        <span className="ct__sep" aria-hidden="true">
          ·
        </span>
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
