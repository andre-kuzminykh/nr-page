import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export interface PanelRenderProps {
  /** Selected AI employee (its number). */
  sel: number
  /** The panel is in focus on the active block and motion is allowed. */
  live: boolean
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
}
