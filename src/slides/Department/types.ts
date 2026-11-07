import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface PanelRenderProps {
  /** Selected AI employee (its number). */
  sel: number
  /** The panel is in focus on the active block and motion is allowed. */
  live: boolean
}

export interface SoloRenderProps extends PanelRenderProps {
  /** Counts the rounds of a solo AI employee's show; it ticks every `ms` while the block is live. */
  round: number
}

export interface PanelDef {
  title: string
  icon: LucideIcon
  meta?: string
  /** AI employees whose work this panel shows. */
  members: number[]
  /** Grid area in the stage layout. */
  area: 'a' | 'b' | 'c' | 'd'
  render: (p: PanelRenderProps) => ReactNode
}

export interface DepartmentStage {
  layout: 'tall-left' | 'tall-right' | 'top-wide' | 'quad'
  panels: PanelDef[]
  /** The order the block plays its AI employees in (default: 1–10 of the department). */
  order?: number[]
  /** One continuous interface instead of separate panels. */
  scene?: (p: PanelRenderProps) => ReactNode
  /**
   * While an AI employee is the only one open in its department, it can have a show of its own
   * instead of the department's interface: one round every `ms`.
   */
  solo?: Partial<Record<number, SoloShow>>
}

export interface SoloShow {
  ms: number
  render: (p: SoloRenderProps) => ReactNode
  /** Where to try it for real: a button beside its element. */
  cta?: { label: string; href: string }
}
