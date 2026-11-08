import {
  Blocks,
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
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import type { ExecutionUnit } from '../../data/architecture'
import type { DepartmentId } from '../../data/departments'

export const DEPARTMENT_ICON: Record<DepartmentId, LucideIcon> = {
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
