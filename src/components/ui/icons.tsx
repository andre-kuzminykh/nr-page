import {
  Blocks,
  Bot,
  ChartNoAxesColumn,
  CodeXml,
  Compass,
  Cpu,
  Handshake,
  LifeBuoy,
  Megaphone,
  PenTool,
  ServerCog,
  Telescope,
  UserRound,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { EmployeeId } from '../../data/employees'
import type { ExecutionUnit } from '../../data/architecture'

export const EMPLOYEE_ICON: Record<EmployeeId, LucideIcon> = {
  management: Compass,
  hr: Users,
  marketing: Telescope,
  smm: Megaphone,
  sales: Handshake,
  support: LifeBuoy,
  analytics: ChartNoAxesColumn,
  design: PenTool,
  development: CodeXml,
  engineering: ServerCog,
}

export const EXECUTION_ICON: Record<ExecutionUnit['id'], LucideIcon> = {
  agents: Cpu,
  workflows: Workflow,
  skills: Blocks,
}

/** AI-Native → robot, AI-First → person. */
export const TYPE_ICON = { robot: Bot, person: UserRound } as const
