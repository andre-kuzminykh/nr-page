import type { DepartmentId } from '../../../data/departments'
import type { DepartmentStage } from '../types'
import { analytics } from './analytics'
import { design } from './design'
import { development } from './development'
import { engineering } from './engineering'
import { hr } from './hr'
import { management } from './management'
import { marketing } from './marketing'
import { sales } from './sales'
import { smm } from './smm'
import { support } from './support'
import './panels.css'

export const STAGES: Record<DepartmentId, DepartmentStage> = {
  management,
  hr,
  marketing,
  smm,
  sales,
  support,
  analytics,
  design,
  development,
  engineering,
}
