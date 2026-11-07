import { ArrowUp } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Type } from '../Kit/Kit'
import './Prompt.css'

export interface PromptProps {
  /** What the bar is for (its label for assistive technology), e.g. “Your business task”. */
  label: string
  /** Shown while the visitor types into it. */
  placeholder: string
  /** Where a request goes: the visitor's text, trimmed (may be empty with `goEmpty`). */
  href: (value: string) => string
  /** The block is on screen and motion is allowed: the demo types itself. */
  live: boolean
  /** What the demo types. Without it the bar is a plain input. */
  text?: string
  /** The demo's text is sent: the button lights and the request runs along the lower edge. */
  sent?: boolean
  /** The demo's last letter is in. */
  onSent?: () => void
  delay?: number
  /** The demo is over: the bar invites the visitor — “Try it yourself”. */
  tryIt?: boolean
  /** The visitor took the bar (it got focus): the demo pauses. */
  onTake?: () => void
  /** The visitor left it empty again. */
  onLeave?: () => void
  /** Sending it empty still goes (to `href('')`); otherwise an empty send just puts the caret in. */
  goEmpty?: boolean
  className?: string
}

/**
 * The one input bar of the site. On a block it first shows what it does — a command or a question
 * types itself and is sent — then invites the visitor to try it. At any moment the visitor can click
 * into it and write their own; sending it takes them to the product with what they wrote.
 */
export function Prompt({
  label,
  placeholder,
  href,
  live,
  text,
  sent = false,
  onSent,
  delay = 260,
  tryIt = false,
  onTake,
  onLeave,
  goEmpty = false,
  className = '',
}: PromptProps) {
  const id = useId()
  const input = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState('')
  const [own, setOwn] = useState(false)
  const demo = !!text && !own && !tryIt && value === ''
  const inviting = tryIt && !own && value === ''

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = value.trim()
    if (!v && !goEmpty) {
      input.current?.focus()
      return
    }
    window.location.assign(href(v))
  }

  const cls = [
    'prompt',
    live ? 'is-live' : 'is-still',
    demo && 'is-demo',
    demo && live && sent && 'is-sent',
    inviting && 'is-try',
    own && 'is-own',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <form className={cls} onSubmit={submit}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        ref={input}
        id={id}
        className="prompt__input"
        type="text"
        value={value}
        maxLength={500}
        autoComplete="off"
        enterKeyHint="send"
        placeholder={demo || inviting ? '' : placeholder}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => {
          if (own) return
          setOwn(true)
          onTake?.()
        }}
        onBlur={() => {
          if (value.trim()) return
          setValue('')
          setOwn(false)
          onLeave?.()
        }}
      />
      {demo && (
        <span className="prompt__q" aria-hidden="true">
          <Type text={text} play={live} speed={30} delay={delay} onDone={onSent} />
        </span>
      )}
      {inviting && (
        <span className="prompt__try" aria-hidden="true">
          <span>Try it yourself</span>
          <i className="prompt__caret" />
        </span>
      )}
      <button type="submit" className="prompt__go" aria-label="Send">
        <ArrowUp size={17} strokeWidth={2} aria-hidden="true" />
      </button>
      <i className="prompt__scan" aria-hidden="true" />
    </form>
  )
}
