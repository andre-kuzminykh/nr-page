import { ArrowUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Type } from '../Kit/Kit'
import './Prompt.css'

/**
 * The bar something is typed into: a question for an AI employee, a command for the Superagent.
 * The text types itself while `live`; once its last letter is in, `onSent` fires and — with `sent` —
 * the send button lights and the request runs along the bar's lower edge.
 */
export function Prompt({
  text,
  live,
  sent,
  onSent,
  lead,
  delay = 260,
}: {
  text: string
  live: boolean
  sent: boolean
  onSent: () => void
  /** Something before the text, such as who the command goes to. */
  lead?: ReactNode
  delay?: number
}) {
  return (
    <div className={`prompt ${live ? 'is-live' : 'is-still'} ${live && sent ? 'is-sent' : ''} ${lead ? 'has-lead' : ''}`}>
      {lead && (
        <span className="prompt__lead" aria-hidden="true">
          {lead}
        </span>
      )}
      <span className="prompt__q">
        <Type text={text} play={live} speed={30} delay={delay} onDone={onSent} />
      </span>
      <span className="prompt__go" aria-hidden="true">
        <ArrowUp size={17} strokeWidth={2} />
      </span>
      <i className="prompt__scan" aria-hidden="true" />
    </div>
  )
}
